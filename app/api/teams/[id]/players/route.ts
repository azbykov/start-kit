import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

/**
 * GET /api/teams/[id]/players
 * Get list of players in a team (public - no authentication required)
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

    // Get players in team
    const players = await prisma.player.findMany({
      where: { teamId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        position: true,
        dateOfBirth: true,
        image: true,
        totalMatches: true,
        totalGoals: true,
        totalAssists: true,
      },
      orderBy: [
        { lastName: "asc" },
        { firstName: "asc" },
      ],
    });

    // Format response
    const formattedPlayers = players.map((player) => ({
      id: player.id,
      firstName: player.firstName,
      lastName: player.lastName,
      position: player.position,
      dateOfBirth: player.dateOfBirth.toISOString().split("T")[0],
      image: player.image,
      totalMatches: player.totalMatches,
      totalGoals: player.totalGoals,
      totalAssists: player.totalAssists,
    }));

    return NextResponse.json({
      players: formattedPlayers,
    });
  } catch (error) {
    logger.error({ error }, "Ошибка получения игроков команды");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

