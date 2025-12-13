import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

/**
 * GET /api/tournaments/[id]/matches
 * Get matches for a tournament (public - no authentication required)
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

    // Get matches for tournament
    const matches = await prisma.match.findMany({
      where: { tournamentId },
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
      },
      orderBy: [
        { date: "asc" },
        { time: "asc" },
      ],
    });

    // Format response
    const formattedMatches = matches.map((match) => ({
      id: match.id,
      date: match.date.toISOString().split("T")[0],
      time: match.time,
      stadium: match.stadium,
      status: match.status,
      homeTeam: {
        id: match.homeTeam.id,
        name: match.homeTeam.name,
        logo: match.homeTeam.logo,
      },
      awayTeam: {
        id: match.awayTeam.id,
        name: match.awayTeam.name,
        logo: match.awayTeam.logo,
      },
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      createdAt: match.createdAt.toISOString(),
    }));

    return NextResponse.json({
      matches: formattedMatches,
    });
  } catch (error) {
    logger.error({ error }, "Ошибка получения матчей турнира");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

