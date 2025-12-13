import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

/**
 * GET /api/tournaments/[id]/statistics
 * Get player statistics for tournament (public - no authentication required)
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

    // Get all match players for tournament matches
    const matchPlayers = await prisma.matchPlayer.findMany({
      where: {
        match: {
          tournamentId,
        },
      },
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
            position: true,
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
    });

    // Aggregate statistics by player
    const playerStatsMap = new Map<
      string,
      {
        player: {
          id: string;
          firstName: string;
          lastName: string;
          image: string | null;
          position: string[];
        };
        team: {
          id: string;
          name: string;
          logo: string | null;
        };
        matches: number;
        goals: number;
        assists: number;
        yellowCards: number;
        redCards: number;
        minutesPlayed: number;
      }
    >();

    matchPlayers.forEach((mp) => {
      const existing = playerStatsMap.get(mp.playerId);
      if (existing) {
        existing.matches += 1;
        existing.goals += mp.goals;
        existing.assists += mp.assists;
        existing.yellowCards += mp.yellowCards;
        existing.redCards += mp.redCards;
        existing.minutesPlayed += mp.minutesPlayed;
      } else {
        playerStatsMap.set(mp.playerId, {
          player: {
            id: mp.player.id,
            firstName: mp.player.firstName,
            lastName: mp.player.lastName,
            image: mp.player.image,
            position: mp.player.position,
          },
          team: {
            id: mp.team.id,
            name: mp.team.name,
            logo: mp.team.logo,
          },
          matches: 1,
          goals: mp.goals,
          assists: mp.assists,
          yellowCards: mp.yellowCards,
          redCards: mp.redCards,
          minutesPlayed: mp.minutesPlayed,
        });
      }
    });

    // Convert to array and sort by goals (desc), then assists (desc)
    const statistics = Array.from(playerStatsMap.values()).sort((a, b) => {
      if (b.goals !== a.goals) return b.goals - a.goals;
      return b.assists - a.assists;
    });

    return NextResponse.json({
      statistics,
    });
  } catch (error) {
    logger.error({ error }, "Ошибка получения статистики турнира");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

