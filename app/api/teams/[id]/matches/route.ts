import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

/**
 * GET /api/teams/[id]/matches
 * Get list of recent matches for a team (public - no authentication required)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;

    // Check if team exists
    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json(
        { error: "Команда не найдена" },
        { status: 404 }
      );
    }

    // Get recent matches for the team
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { homeTeamId: teamId },
          { awayTeamId: teamId },
        ],
      },
      include: {
        homeTeam: { select: { id: true, name: true, logo: true } },
        awayTeam: { select: { id: true, name: true, logo: true } },
        tournament: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
      take: 10, // Last 10 matches
    });

    // Format response
    const formattedMatches = matches.map((match) => ({
      id: match.id,
      date: match.date.toISOString().split("T")[0],
      homeTeamId: match.homeTeamId,
      homeTeamName: match.homeTeam.name,
      homeTeamLogo: match.homeTeam.logo,
      awayTeamId: match.awayTeamId,
      awayTeamName: match.awayTeam.name,
      awayTeamLogo: match.awayTeam.logo,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      tournamentId: match.tournamentId,
      tournamentName: match.tournament?.name || null,
    }));

    return NextResponse.json({
      matches: formattedMatches,
    });
  } catch (error) {
    logger.error({ error }, "Ошибка получения матчей команды");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

