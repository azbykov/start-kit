import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

/**
 * GET /api/teams/[id]/matches
 * Get upcoming and past matches for a team (public - no authentication required)
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const baseInclude = {
      homeTeam: { select: { id: true, name: true, logo: true } },
      awayTeam: { select: { id: true, name: true, logo: true } },
      tournament: { select: { id: true, name: true, shortName: true } },
    } as const;

    // Upcoming matches
    const upcomingMatches = await prisma.match.findMany({
      where: {
        OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
        date: { gte: today },
        status: { in: ["SCHEDULED", "LIVE"] },
      },
      include: baseInclude,
      orderBy: { date: "asc" },
      take: 10,
    });

    // Past matches
    const pastMatches = await prisma.match.findMany({
      where: {
        OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
        status: "FINISHED",
      },
      include: baseInclude,
      orderBy: { date: "desc" },
      take: 10,
    });

    const formatMatch = (match: (typeof upcomingMatches)[number]) => ({
      id: match.id,
      date: match.date.toISOString().split("T")[0],
      time: match.time,
      status: match.status,
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
      tournamentShortName: match.tournament?.shortName || null,
    });

    return NextResponse.json({
      upcoming: upcomingMatches.map(formatMatch),
      past: pastMatches.map(formatMatch),
    });
  } catch (error) {
    logger.error({ error }, "Ошибка получения матчей команды");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

