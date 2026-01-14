import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

/**
 * GET /api/teams/[id]/statistics
 * Get aggregated team statistics across all games (public - no authentication required)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true },
    });

    if (!team) {
      return NextResponse.json({ error: "Команда не найдена" }, { status: 404 });
    }

    const finishedMatches = await prisma.match.findMany({
      where: {
        OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
        status: "FINISHED",
        homeScore: { not: null },
        awayScore: { not: null },
      },
      select: {
        homeTeamId: true,
        awayTeamId: true,
        homeScore: true,
        awayScore: true,
      },
    });

    let played = 0;
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    finishedMatches.forEach((m) => {
      const isHome = m.homeTeamId === teamId;
      const isAway = m.awayTeamId === teamId;
      if (!isHome && !isAway) return;

      played += 1;
      const teamScore = isHome ? m.homeScore! : m.awayScore!;
      const opponentScore = isHome ? m.awayScore! : m.homeScore!;

      goalsFor += teamScore;
      goalsAgainst += opponentScore;

      if (teamScore > opponentScore) wins += 1;
      else if (teamScore === opponentScore) draws += 1;
      else losses += 1;
    });

    const points = wins * 3 + draws;
    const goalDifference = goalsFor - goalsAgainst;

    return NextResponse.json({
      statistics: {
        played,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        goalDifference,
        points,
      },
    });
  } catch (error) {
    logger.error({ error }, "Ошибка получения статистики команды");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

