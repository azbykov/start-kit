import { auth } from "@/lib/auth";
import { verifyUserRole } from "@/lib/auth/roles";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import { updateMatchPlayerSchema } from "@/lib/validations/match";

/**
 * PATCH /api/admin/matches/[id]/players/[playerId]
 * Update player statistics in match
 */
export async function PATCH(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; playerId: string }> }
) {
  try {
    const { id: matchId, playerId } = await params;
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const hasAccess = await verifyUserRole(Role.ADMIN);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    // Check if match player exists
    const existingMatchPlayer = await prisma.matchPlayer.findUnique({
      where: {
        matchId_playerId: {
          matchId,
          playerId,
        },
      },
    });

    if (!existingMatchPlayer) {
      return NextResponse.json(
        { error: "Игрок не найден в матче" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = updateMatchPlayerSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Некорректные данные" },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (validationResult.data.goals !== undefined) {
      updateData.goals = validationResult.data.goals;
    }
    if (validationResult.data.assists !== undefined) {
      updateData.assists = validationResult.data.assists;
    }
    if (validationResult.data.yellowCards !== undefined) {
      updateData.yellowCards = validationResult.data.yellowCards;
    }
    if (validationResult.data.redCards !== undefined) {
      updateData.redCards = validationResult.data.redCards;
    }
    if (validationResult.data.minutesPlayed !== undefined) {
      updateData.minutesPlayed = validationResult.data.minutesPlayed;
    }
    if (validationResult.data.isStarter !== undefined) {
      updateData.isStarter = validationResult.data.isStarter;
    }

    // Update match player
    const updatedMatchPlayer = await prisma.matchPlayer.update({
      where: {
        matchId_playerId: {
          matchId,
          playerId,
        },
      },
      data: updateData,
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log audit action
    logger.info(
      {
        action: "match.player.updated",
        matchId,
        playerId,
        adminId: session.user.id,
      },
      "Player statistics updated in match by admin"
    );

    // Format response
    return NextResponse.json({
      id: updatedMatchPlayer.id,
      matchId: updatedMatchPlayer.matchId,
      playerId: updatedMatchPlayer.playerId,
      playerName: `${updatedMatchPlayer.player.firstName} ${updatedMatchPlayer.player.lastName}`,
      playerImage: updatedMatchPlayer.player.image,
      teamId: updatedMatchPlayer.teamId,
      teamName: updatedMatchPlayer.team.name,
      goals: updatedMatchPlayer.goals,
      assists: updatedMatchPlayer.assists,
      yellowCards: updatedMatchPlayer.yellowCards,
      redCards: updatedMatchPlayer.redCards,
      minutesPlayed: updatedMatchPlayer.minutesPlayed,
      isStarter: updatedMatchPlayer.isStarter,
    });
  } catch (error) {
    logger.error({ error }, "Ошибка обновления статистики игрока в матче");

    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/matches/[id]/players/[playerId]
 * Remove player from match
 */
export async function DELETE(
  _request: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; playerId: string }> }
) {
  try {
    const { id: matchId, playerId } = await params;
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const hasAccess = await verifyUserRole(Role.ADMIN);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    // Check if match player exists
    const existingMatchPlayer = await prisma.matchPlayer.findUnique({
      where: {
        matchId_playerId: {
          matchId,
          playerId,
        },
      },
      include: {
        player: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!existingMatchPlayer) {
      return NextResponse.json(
        { error: "Игрок не найден в матче" },
        { status: 404 }
      );
    }

    // Delete match player
    await prisma.matchPlayer.delete({
      where: {
        matchId_playerId: {
          matchId,
          playerId,
        },
      },
    });

    // Log audit action
    logger.info(
      {
        action: "match.player.deleted",
        matchId,
        playerId,
        adminId: session.user.id,
      },
      "Player removed from match by admin"
    );

    return NextResponse.json({
      success: true,
      message: "Игрок удалён из матча",
    });
  } catch (error) {
    logger.error({ error }, "Ошибка удаления игрока из матча");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}











