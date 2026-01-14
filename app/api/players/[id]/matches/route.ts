import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

/**
 * GET /api/players/[id]/matches
 * Get matches for a player with player statistics (public - no authentication required)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: playerId } = await params;

    // Check if player exists
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return NextResponse.json(
        { error: "Игрок не найден" },
        { status: 404 }
      );
    }

    // Get all match players for this player
    const matchPlayers = await prisma.matchPlayer.findMany({
      where: { playerId },
      include: {
        match: {
          include: {
            homeTeam: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
            awayTeam: {
              select: {
                id: true,
                name: true,
                logo: true,
              },
            },
            tournament: {
              select: {
                id: true,
                name: true,
                shortName: true,
                logo: true,
              },
            },
          },
        },
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
      orderBy: {
        match: {
          date: "desc",
        },
      },
    });

    // Format response
    const matches = matchPlayers.map((mp) => ({
      match: {
        id: mp.match.id,
        date: mp.match.date.toISOString(),
        time: mp.match.time,
        stadium: mp.match.stadium,
        status: mp.match.status,
        homeTeam: {
          id: mp.match.homeTeam.id,
          name: mp.match.homeTeam.name,
          logo: mp.match.homeTeam.logo,
        },
        awayTeam: {
          id: mp.match.awayTeam.id,
          name: mp.match.awayTeam.name,
          logo: mp.match.awayTeam.logo,
        },
        homeScore: mp.match.homeScore,
        awayScore: mp.match.awayScore,
        tournament: mp.match.tournament
          ? {
              id: mp.match.tournament.id,
              name: mp.match.tournament.name,
              shortName: mp.match.tournament.shortName,
              logo: mp.match.tournament.logo,
            }
          : null,
      },
      playerStats: {
        goals: mp.goals,
        assists: mp.assists,
        ownGoals: mp.ownGoals,
        yellowCards: mp.yellowCards,
        redCards: mp.redCards,
        minutesPlayed: mp.minutesPlayed,
        isStarter: mp.isStarter,
      },
      team: {
        id: mp.team.id,
        name: mp.team.name,
        logo: mp.team.logo,
      },
    }));

    // Separate into upcoming and past matches
    const now = new Date();
    const upcomingMatches = matches.filter(
      (m) => new Date(m.match.date) > now && m.match.status !== "FINISHED"
    );
    const pastMatches = matches.filter(
      (m) =>
        new Date(m.match.date) <= now || m.match.status === "FINISHED"
    );

    return NextResponse.json({
      upcoming: upcomingMatches,
      past: pastMatches,
    });
  } catch (error) {
    logger.error({ error }, "Ошибка получения матчей игрока");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
