import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

/**
 * GET /api/tournaments/[id]/standings
 * Get tournament standings/table (public - no authentication required)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params;

    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Турнир не найден" },
        { status: 404 }
      );
    }

    // Get teams in tournament
    const tournamentTeams = await prisma.tournamentTeam.findMany({
      where: { tournamentId },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    // Get finished matches for tournament
    const finishedMatches = await prisma.match.findMany({
      where: {
        tournamentId,
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

    // Calculate standings for each team
    const standings = tournamentTeams.map((tt) => {
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

        if (isHome || isAway) {
          played++;
          const teamScore = isHome ? match.homeScore! : match.awayScore!;
          const opponentScore = isHome ? match.awayScore! : match.homeScore!;

          goalsFor += teamScore;
          goalsAgainst += opponentScore;

          if (teamScore > opponentScore) {
            wins++;
          } else if (teamScore === opponentScore) {
            draws++;
          } else {
            losses++;
          }
        }
      });

      const points = wins * 3 + draws;
      const goalDifference = goalsFor - goalsAgainst;

      return {
        team: {
          id: tt.team.id,
          name: tt.team.name,
          logo: tt.team.logo,
        },
        played,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        goalDifference,
        points,
      };
    });

    // Sort by points (desc), then goal difference (desc), then goals for (desc)
    standings.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

    return NextResponse.json({
      standings,
    });
  } catch (error) {
    logger.error({ error }, "Ошибка получения таблицы турнира");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

