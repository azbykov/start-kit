import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

/**
 * GET /api/matches/[id]
 * Get public match profile (no authentication required)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const match = await prisma.match.findUnique({
      where: { id },
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
            logo: true,
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json(
        { error: "Матч не найден" },
        { status: 404 }
      );
    }

    // Format response
    return NextResponse.json({
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
      // Extended fields
      duration: match.duration,
      homeScoreHT: match.homeScoreHT,
      awayScoreHT: match.awayScoreHT,
      homeScoreET: match.homeScoreET,
      awayScoreET: match.awayScoreET,
      homeScoreP: match.homeScoreP,
      awayScoreP: match.awayScoreP,
      tournament: match.tournament
        ? {
            id: match.tournament.id,
            name: match.tournament.name,
            logo: match.tournament.logo,
          }
        : null,
    });
  } catch (error) {
    logger.error({ error }, "Ошибка получения профиля матча");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}


