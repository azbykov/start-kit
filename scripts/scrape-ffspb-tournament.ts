import axios from "axios";
import * as cheerio from "cheerio";
import fs from "node:fs/promises";
import path from "node:path";

type TournamentJson = {
  tournamentId: number;
  tournamentUrl: string;
  scrapedAtIso: string;
  teams: TeamJson[];
  errors: ScrapeError[];
};

type TeamJson = {
  teamId: number;
  teamUrl: string;
  name: string | null;
  city: string | null;
  players: PlayerJson[];
};

type PlayerJson = {
  playerId: number | null;
  profileUrl: string | null;
  lastName: string | null;
  firstName: string | null;
  fullName: string | null;
  position: string | null;
  number: number | null;
  ageText: string | null;
  citizenship: string | null;
  photoSmallUrl: string | null;
  photoUrl: string | null;
};

type ScrapeError = {
  url: string;
  message: string;
};

function getArgValue(name: string): string | null {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

function getArgFlag(name: string): boolean {
  return process.argv.includes(name);
}

function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

function extractTeamIdsFromTournamentHtml(
  tournamentId: number,
  html: string
): number[] {
  const ids = new Set<number>();
  const re = new RegExp(
    `https://stat\\.ffspb\\.org/tournament${tournamentId}/team/(\\d+)/players`,
    "g"
  );
  for (const match of html.matchAll(re)) {
    const teamId = Number(match[1]);
    if (Number.isFinite(teamId)) ids.add(teamId);
  }
  return [...ids].sort((a, b) => a - b);
}

async function fetchHtml(url: string): Promise<string> {
  const resp = await axios.get(url, {
    responseType: "text",
    timeout: 30_000,
    headers: {
      // A basic UA helps avoid some "bot" blocks.
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
    },
    validateStatus: (status) => status >= 200 && status < 400,
  });
  return String(resp.data);
}

function parseTeamAbout($: cheerio.CheerioAPI): {
  name: string | null;
  city: string | null;
} {
  const aboutTable = $("table.table").first();
  if (!aboutTable.length) return { name: null, city: null };

  let name: string | null = null;
  let city: string | null = null;

  aboutTable.find("tbody tr").each((_, tr) => {
    const th = normalizeWhitespace($(tr).find("th").first().text());
    const td = normalizeWhitespace($(tr).find("td").first().text());
    if (!th) return;
    if (th === "Название") name = td || null;
    if (th === "Город") city = td || null;
  });

  return { name, city };
}

function parsePlayers($: cheerio.CheerioAPI): PlayerJson[] {
  const players: PlayerJson[] = [];

  $("#view-team-players-list .numeratable_row").each((_, row) => {
    const $row = $(row);

    const profileUrl =
      $row.find('a[href*="/player/"]').first().attr("href") ?? null;
    const playerId = profileUrl
      ? Number(profileUrl.match(/\/player\/(\d+)/)?.[1] ?? NaN)
      : null;

    const nameCol = $row.find(".col-xs-4").first();
    const lastName = normalizeWhitespace(nameCol.find("strong a").text()) || null;

    const nameTexts = nameCol
      .contents()
      .toArray()
      .filter((n) => n.type === "text")
      .map((n) => normalizeWhitespace($(n).text()))
      .filter(Boolean);

    // Typically: [firstName, "10 лет"]
    const firstName = nameTexts[0] ?? null;
    const ageText =
      nameTexts.find((t) => /лет/i.test(t)) ??
      normalizeWhitespace(nameCol.text()).match(/(\d+\s*лет)/i)?.[1] ??
      null;
    const fullName =
      normalizeWhitespace([lastName ?? "", firstName ?? ""].join(" ")).trim() ||
      null;

    const infoColText = normalizeWhitespace($row.find(".col-xs-4").eq(1).text());
    const citizenshipText = normalizeWhitespace(
      $row.find(".col-xs-4").eq(2).text()
    );

    const position =
      infoColText.match(/Амплуа:\s*(.*?)\s*(Номер игрока:|$)/)?.[1]?.trim() ||
      null;

    const numberRaw = infoColText.match(/Номер игрока:\s*(\d+)/)?.[1] ?? null;
    const number = numberRaw ? Number(numberRaw) : null;

    const citizenship =
      citizenshipText.match(/Гражданство:\s*(.*)$/)?.[1]?.trim() || null;

    const photoSmallUrl = $row.find("img").first().attr("src") ?? null;
    const photoUrl = $row.find("a.fancybox-full-image").first().attr("href") ?? null;

    players.push({
      playerId: Number.isFinite(playerId) ? playerId : null,
      profileUrl,
      lastName,
      firstName,
      fullName,
      position,
      number: Number.isFinite(number) ? number : null,
      ageText,
      citizenship,
      photoSmallUrl,
      photoUrl,
    });
  });

  return players;
}

async function main() {
  const tournamentIdRaw = getArgValue("--tournament") ?? "43477";
  const tournamentId = Number(tournamentIdRaw);

  if (!Number.isFinite(tournamentId)) {
    // Intentionally in English (code-only rule). Output is for CLI usage.
    throw new Error(`Invalid --tournament value: ${tournamentIdRaw}`);
  }

  const outPath =
    getArgValue("--out") ??
    path.join("tmp", `ffspb-tournament-${tournamentId}.json`);

  const tournamentUrl = `https://stat.ffspb.org/tournament${tournamentId}`;
  const scrapedAtIso = new Date().toISOString();

  const errors: ScrapeError[] = [];

  const tournamentHtml = await fetchHtml(tournamentUrl);
  const teamIds = extractTeamIdsFromTournamentHtml(tournamentId, tournamentHtml);

  if (teamIds.length === 0) {
    throw new Error(
      `No teams found on tournament page. URL: ${tournamentUrl}`
    );
  }

  const teams: TeamJson[] = [];

  for (const teamId of teamIds) {
    const teamUrl = `${tournamentUrl}/team/${teamId}/players`;
    try {
      const teamHtml = await fetchHtml(teamUrl);
      const $ = cheerio.load(teamHtml);

      const { name, city } = parseTeamAbout($);
      const players = parsePlayers($);

      teams.push({
        teamId,
        teamUrl,
        name,
        city,
        players,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push({ url: teamUrl, message });
      teams.push({
        teamId,
        teamUrl,
        name: null,
        city: null,
        players: [],
      });
    }

    // Small delay: be polite to the website.
    await new Promise((r) => setTimeout(r, 200));
  }

  const result: TournamentJson = {
    tournamentId,
    tournamentUrl,
    scrapedAtIso,
    teams,
    errors,
  };

  const outAbs = path.isAbsolute(outPath)
    ? outPath
    : path.join(process.cwd(), outPath);

  await fs.mkdir(path.dirname(outAbs), { recursive: true });
  await fs.writeFile(outAbs, JSON.stringify(result, null, 2), "utf-8");

  if (!getArgFlag("--quiet")) {
    // eslint-disable-next-line no-console
    console.log(
      `Saved ${teams.length} teams (${teams.reduce((a, t) => a + t.players.length, 0)} players) to ${outAbs}`
    );
    if (errors.length) {
      // eslint-disable-next-line no-console
      console.log(`Warnings: ${errors.length} team pages failed`);
    }
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});


