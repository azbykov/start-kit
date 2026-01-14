import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

/**
 * GET /api/players/[id]
 * Get public player profile (no authentication required)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const player = await prisma.player.findUnique({
      where: { id },
    });

    if (!player) {
      return NextResponse.json(
        { error: "Игрок не найден" },
        { status: 404 }
      );
    }

    // Format response with public fields only
    return NextResponse.json({
      id: player.id,
      firstName: player.firstName,
      lastName: player.lastName,
      position: player.position, // Array of Position enum values
      dateOfBirth: player.dateOfBirth.toISOString().split("T")[0], // ISO date only
      teamId: player.teamId,
      image: player.image,
      rating: player.rating,
      statistics: {
        totalMatches: player.totalMatches,
        totalGoals: player.totalGoals,
        totalAssists: player.totalAssists,
        totalMinutes: player.totalMinutes,
      },
      videoLinks: player.videoLinks,
    });
  } catch (error) {
    logger.error({ error }, "Ошибка получения профиля игрока");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

