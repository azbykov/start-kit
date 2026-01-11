import { PrismaClient, Position } from "@prisma/client";
import axios from "axios";
import * as cheerio from "cheerio";
import fs from "node:fs/promises";
import path from "node:path";

type TournamentJson = {
  tournamentId: number;
  tournamentUrl: string;
  tournamentName?: string | null;
  scrapedAtIso: string;
  teams: TeamJson[];
  errors?: Array<{ url: string; message: string }>;
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
  position: string | null;
  ageText: string | null;
  photoUrl: string | null;
};

type ImportResult = {
  teamsUpserted: number;
  playersUpserted: number;
  playersWithFetchedDob: number;
  warnings: Array<{ message: string; context?: Record<string, unknown> }>;
};

function getArgValue(name: string): string | null {
  const idx = process.argv.indexOf(name);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

function parseDdMmYyyy(input: string): Date | null {
  const m = input.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!m) return null;
  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);
  if (!dd || !mm || !yyyy) return null;
  // Use UTC to avoid timezone shifts.
  const dt = new Date(Date.UTC(yyyy, mm - 1, dd, 0, 0, 0));
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function approximateDobFromAgeText(ageText: string | null): Date | null {
  if (!ageText) return null;
  const age = Number(ageText.match(/(\d+)/)?.[1] ?? NaN);
  if (!Number.isFinite(age) || age <= 0) return null;
  const year = new Date().getUTCFullYear() - age;
  return new Date(Date.UTC(year, 0, 1, 0, 0, 0));
}

function mapRussianPositionToEnum(position: string | null): Position[] {
  const p = normalizeWhitespace(position ?? "").toLowerCase();
  if (!p) return [];
  if (p.includes("вратар")) return [Position.GK];
  if (p.includes("защит")) return [Position.CB];
  if (p.includes("полузащит")) return [Position.CM];
  if (p.includes("напада")) return [Position.CF];
  return [];
}

async function fetchHtml(url: string): Promise<string> {
  const resp = await axios.get(url, {
    responseType: "text",
    timeout: 30_000,
    headers: {
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

async function fetchPlayerDob(profileUrl: string): Promise<Date | null> {
  const html = await fetchHtml(profileUrl);
  const $ = cheerio.load(html);
  let dobText: string | null = null;

  $("table.table tr").each((_, tr) => {
    const th = normalizeWhitespace($(tr).find("th").first().text());
    if (th !== "Дата рождения") return;
    dobText = normalizeWhitespace($(tr).find("td").first().text()) || null;
  });

  if (!dobText) return null;
  return parseDdMmYyyy(dobText);
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const abs = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
  const raw = await fs.readFile(abs, "utf-8");
  return JSON.parse(raw) as T;
}

async function main() {
  const prisma = new PrismaClient();

  const inPath =
    getArgValue("--in") ??
    path.join("tmp", "ffspb-tournament-43477.json");

  const data = await readJsonFile<TournamentJson>(inPath);

  const result: ImportResult = {
    teamsUpserted: 0,
    playersUpserted: 0,
    playersWithFetchedDob: 0,
    warnings: [],
  };

  const tournamentName =
    (typeof data.tournamentName === "string" && data.tournamentName.trim()
      ? normalizeWhitespace(data.tournamentName)
      : null) ?? `Турнир ФФСПб #${data.tournamentId}`;

  const dbTournament = await prisma.tournament.upsert({
    where: { ffspbTournamentId: data.tournamentId },
    create: {
      ffspbTournamentId: data.tournamentId,
      ffspbTournamentUrl: data.tournamentUrl,
      name: tournamentName,
      description: `Импортировано из ${data.tournamentUrl}`,
    },
    update: {
      ffspbTournamentUrl: data.tournamentUrl,
      name: tournamentName,
    },
  });

  for (const team of data.teams) {
    const teamName = team.name ?? `Команда ${team.teamId}`;

    const dbTeam = await prisma.team.upsert({
      where: { ffspbTeamId: team.teamId },
      create: {
        name: teamName,
        city: team.city,
        ffspbTeamId: team.teamId,
        ffspbTeamUrl: team.teamUrl,
      },
      update: {
        name: teamName,
        city: team.city,
        ffspbTeamUrl: team.teamUrl,
      },
    });

    result.teamsUpserted++;

    await prisma.tournamentTeam.upsert({
      where: {
        tournamentId_teamId: {
          tournamentId: dbTournament.id,
          teamId: dbTeam.id,
        },
      },
      create: {
        tournamentId: dbTournament.id,
        teamId: dbTeam.id,
      },
      update: {},
    });

    for (const player of team.players) {
      if (!player.firstName || !player.lastName) {
        result.warnings.push({
          message: "Skipped player due to missing first/last name",
          context: { teamId: team.teamId, playerId: player.playerId },
        });
        continue;
      }

      const positions = mapRussianPositionToEnum(player.position);

      let dateOfBirth: Date | null = null;
      if (player.profileUrl) {
        try {
          dateOfBirth = await fetchPlayerDob(player.profileUrl);
          if (dateOfBirth) result.playersWithFetchedDob++;
        } catch (e) {
          result.warnings.push({
            message: "Failed to fetch DOB from player profile",
            context: {
              teamId: team.teamId,
              playerId: player.playerId,
              profileUrl: player.profileUrl,
              error: e instanceof Error ? e.message : String(e),
            },
          });
        }
      }

      if (!dateOfBirth) {
        dateOfBirth = approximateDobFromAgeText(player.ageText);
        if (!dateOfBirth) {
          // Last-resort fallback: keep DB consistent.
          dateOfBirth = new Date(Date.UTC(2000, 0, 1, 0, 0, 0));
          result.warnings.push({
            message:
              "DOB missing; used hard fallback 2000-01-01 (consider improving scraper)",
            context: { teamId: team.teamId, playerId: player.playerId },
          });
        } else {
          result.warnings.push({
            message: "DOB missing; approximated from ageText",
            context: {
              teamId: team.teamId,
              playerId: player.playerId,
              ageText: player.ageText,
              dob: dateOfBirth.toISOString(),
            },
          });
        }
      }

      const ffspbPlayerId = player.playerId ?? null;

      if (!ffspbPlayerId) {
        result.warnings.push({
          message: "Skipped player due to missing ffspb playerId",
          context: { teamId: team.teamId, name: `${player.lastName} ${player.firstName}` },
        });
        continue;
      }

      await prisma.player.upsert({
        where: { ffspbPlayerId },
        create: {
          firstName: player.firstName,
          lastName: player.lastName,
          position: positions,
          dateOfBirth,
          teamId: dbTeam.id,
          image: player.photoUrl,
          ffspbPlayerId,
          ffspbProfileUrl: player.profileUrl,
        },
        update: {
          firstName: player.firstName,
          lastName: player.lastName,
          position: positions,
          dateOfBirth,
          teamId: dbTeam.id,
          image: player.photoUrl,
          ffspbProfileUrl: player.profileUrl,
        },
      });

      result.playersUpserted++;

      // Be polite to the website (player pages).
      await new Promise((r) => setTimeout(r, 120));
    }
  }

  // eslint-disable-next-line no-console
  console.log(
    JSON.stringify(
      {
        tournamentId: data.tournamentId,
        tournamentUrl: data.tournamentUrl,
        tournamentName,
        teamsUpserted: result.teamsUpserted,
        playersUpserted: result.playersUpserted,
        playersWithFetchedDob: result.playersWithFetchedDob,
        warnings: result.warnings.length,
      },
      null,
      2
    )
  );

  if (result.warnings.length) {
    const outWarnings = getArgValue("--warningsOut");
    if (outWarnings) {
      const abs = path.isAbsolute(outWarnings)
        ? outWarnings
        : path.join(process.cwd(), outWarnings);
      await fs.mkdir(path.dirname(abs), { recursive: true });
      await fs.writeFile(abs, JSON.stringify(result.warnings, null, 2), "utf-8");
      // eslint-disable-next-line no-console
      console.log(`Warnings saved to ${abs}`);
    }
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});


