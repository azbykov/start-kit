import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

/**
 * GET /api/teams/[id]
 * Get public team profile (no authentication required)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        _count: {
          select: { players: true },
        },
      },
    });

    if (!team) {
      return NextResponse.json(
        { error: "Команда не найдена" },
        { status: 404 }
      );
    }

    // Format response with public fields
    return NextResponse.json({
      id: team.id,
      name: team.name,
      logo: team.logo,
      coach: team.coach,
      city: team.city,
      country: team.country,
      isActive: team.isActive,
      playersCount: team._count.players,
    });
  } catch (error) {
    logger.error({ error }, "Ошибка получения профиля команды");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

