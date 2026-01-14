import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

/**
 * GET /api/tournaments/[id]/team-statistics
 * Get aggregated team statistics for tournament (public - no authentication required)
 *
 * Ranking: points desc, goalDifference desc, goalsFor desc
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params;

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { id: true },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Турнир не найден" },
        { status: 404 }
      );
    }

    const tournamentTeams = await prisma.tournamentTeam.findMany({
      where: { tournamentId },
      include: {
        team: {
          select: { id: true, name: true, logo: true },
        },
      },
    });

    const finishedMatches = await prisma.match.findMany({
      where: {
        tournamentId,
        status: "FINISHED",
        homeScore: { not: null },
        awayScore: { not: null },
      },
      select: {
        id: true,
        homeTeamId: true,
        awayTeamId: true,
        homeScore: true,
        awayScore: true,
      },
    });

    const matchIds = finishedMatches.map((m) => m.id);

    const teamAggRows =
      matchIds.length > 0
        ? await prisma.matchPlayer.groupBy({
            by: ["teamId"],
            where: { matchId: { in: matchIds } },
            _sum: {
              goals: true,
              assists: true,
              yellowCards: true,
              redCards: true,
              minutesPlayed: true,
            },
          })
        : [];

    const aggByTeamId = new Map<
      string,
      {
        goals: number;
        assists: number;
        yellowCards: number;
        redCards: number;
        minutesPlayed: number;
      }
    >(
      teamAggRows.map((r) => [
        r.teamId,
        {
          goals: r._sum.goals ?? 0,
          assists: r._sum.assists ?? 0,
          yellowCards: r._sum.yellowCards ?? 0,
          redCards: r._sum.redCards ?? 0,
          minutesPlayed: r._sum.minutesPlayed ?? 0,
        },
      ])
    );

    const teams = tournamentTeams.map((tt) => {
      const teamId = tt.team.id;
      let played = 0;
      let wins = 0;
      let draws = 0;
      let losses = 0;
      let goalsFor = 0;
      let goalsAgainst = 0;

      finishedMatches.forEach((match) => {
        const isHome = match.homeTeamId === teamId;
        const isAway = match.awayTeamId === teamId;
        if (!isHome && !isAway) return;

        played += 1;
        const teamScore = isHome ? match.homeScore! : match.awayScore!;
        const opponentScore = isHome ? match.awayScore! : match.homeScore!;

        goalsFor += teamScore;
        goalsAgainst += opponentScore;

        if (teamScore > opponentScore) wins += 1;
        else if (teamScore === opponentScore) draws += 1;
        else losses += 1;
      });

      const points = wins * 3 + draws;
      const goalDifference = goalsFor - goalsAgainst;
      const extra = aggByTeamId.get(teamId) ?? {
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        minutesPlayed: 0,
      };

      return {
        team: tt.team,
        played,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        goalDifference,
        points,
        // extra per-team metrics from MatchPlayer
        assists: extra.assists,
        yellowCards: extra.yellowCards,
        redCards: extra.redCards,
        minutesPlayed: extra.minutesPlayed,
      };
    });

    teams.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) {
        return b.goalDifference - a.goalDifference;
      }
      return b.goalsFor - a.goalsFor;
    });

    return NextResponse.json({ teams });
  } catch (error) {
    logger.error({ error }, "Ошибка получения командной статистики турнира");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

