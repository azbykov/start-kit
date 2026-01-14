import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import { Position } from "@prisma/client";

type Scope = "all" | "tournament" | "team" | "position" | "age";

function toInt(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

/**
 * GET /api/players/rankings
 * Ranking players by rating with optional scopes:
 * - all: all players
 * - tournament: players who participated in a tournament (tournamentId required)
 * - team: players in a team (teamId required)
 * - position: players matching position (position required)
 * - age: players by age range (ageFrom/ageTo or birthYearFrom/birthYearTo)
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const scope = ((sp.get("scope") || "all").trim() as Scope) || "all";

    const tournamentId = (sp.get("tournamentId") || "").trim() || null;
    const teamId = (sp.get("teamId") || "").trim() || null;
    const positionParam = (sp.get("position") || "").trim();
    const limitParam = toInt(sp.get("limit"));
    const limit = Math.max(1, Math.min(limitParam ?? 50, 200));

    const ratingFrom = toInt(sp.get("ratingFrom"));
    const ratingTo = toInt(sp.get("ratingTo"));

    const ageFrom = toInt(sp.get("ageFrom"));
    const ageTo = toInt(sp.get("ageTo"));
    const birthYearFrom = toInt(sp.get("birthYearFrom"));
    const birthYearTo = toInt(sp.get("birthYearTo"));

    const where: any = {};

    if (ratingFrom !== null || ratingTo !== null) {
      where.rating = {};
      if (ratingFrom !== null) where.rating.gte = Math.max(0, ratingFrom);
      if (ratingTo !== null) where.rating.lte = Math.min(100, ratingTo);
    }

    if (scope === "tournament") {
      if (!tournamentId) {
        return NextResponse.json(
          { error: "Не указан tournamentId" },
          { status: 400 }
        );
      }
      where.matchPlayers = {
        some: { match: { tournamentId } },
      };
    }

    if (scope === "team") {
      if (!teamId) {
        return NextResponse.json(
          { error: "Не указан teamId" },
          { status: 400 }
        );
      }
      where.teamId = teamId;
    }

    if (scope === "position") {
      if (!positionParam) {
        return NextResponse.json(
          { error: "Не указана позиция" },
          { status: 400 }
        );
      }
      if (!Object.values(Position).includes(positionParam as Position)) {
        return NextResponse.json(
          { error: "Некорректная позиция" },
          { status: 400 }
        );
      }
      where.position = { has: positionParam as Position };
    }

    if (scope === "age") {
      const now = new Date();
      const currentYear = now.getFullYear();

      let byFrom = birthYearFrom;
      let byTo = birthYearTo;

      if (ageFrom !== null || ageTo !== null) {
        // Age: younger -> bigger birthYear. Example: ageFrom=10, ageTo=12 => birthYear 2014..2016 for 2026.
        const aFrom = ageFrom ?? 0;
        const aTo = ageTo ?? aFrom;
        const minAge = Math.max(0, Math.min(aFrom, aTo));
        const maxAge = Math.max(0, Math.max(aFrom, aTo));
        byFrom = currentYear - maxAge;
        byTo = currentYear - minAge;
      }

      if (byFrom === null || byTo === null) {
        return NextResponse.json(
          { error: "Укажите ageFrom/ageTo или birthYearFrom/birthYearTo" },
          { status: 400 }
        );
      }

      const fromYear = Math.min(byFrom, byTo);
      const toYear = Math.max(byFrom, byTo);

      const fromDate = new Date(fromYear, 0, 1, 0, 0, 0, 0);
      const toDate = new Date(toYear, 11, 31, 23, 59, 59, 999);

      where.dateOfBirth = { gte: fromDate, lte: toDate };
    }

    if (!["all", "tournament", "team", "position", "age"].includes(scope)) {
      return NextResponse.json({ error: "Некорректный scope" }, { status: 400 });
    }

    const players = await prisma.player.findMany({
      where,
      orderBy: [{ rating: "desc" }, { lastName: "asc" }, { firstName: "asc" }],
      take: limit,
      include: {
        team: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({
      scope,
      limit,
      players: players.map((p) => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        position: p.position,
        dateOfBirth: p.dateOfBirth.toISOString().split("T")[0],
        teamId: p.teamId,
        teamName: p.team?.name || null,
        image: p.image,
        rating: p.rating,
        totalMatches: p.totalMatches,
        totalGoals: p.totalGoals,
        totalAssists: p.totalAssists,
        totalMinutes: p.totalMinutes,
      })),
    });
  } catch (error) {
    logger.error({ error }, "Ошибка получения рейтинга игроков");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

