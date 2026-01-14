import { auth } from "@/lib/auth";
import { verifyUserRole } from "@/lib/auth/roles";
import { Role, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import { updatePlayerSchema } from "@/lib/validations/player";

/**
 * PATCH /api/admin/players/[id]
 * Update player data
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const body = await request.json();

    // Validate request body (validation schema will handle string to Date conversion)
    const validationResult = updatePlayerSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Некорректные данные" },
        { status: 400 }
      );
    }

    // Check if player exists
    const existingPlayer = await prisma.player.findUnique({
      where: { id },
    });

    if (!existingPlayer) {
      return NextResponse.json(
        { error: "Игрок не найден" },
        { status: 404 }
      );
    }

    // Get previous values for audit log
    const previousValues = {
      firstName: existingPlayer.firstName,
      lastName: existingPlayer.lastName,
      position: existingPlayer.position,
    };

    const updateData: any = {};
    
    if (validationResult.data.firstName !== undefined) {
      updateData.firstName = validationResult.data.firstName;
    }
    if (validationResult.data.lastName !== undefined) {
      updateData.lastName = validationResult.data.lastName;
    }
    if (validationResult.data.position !== undefined) {
      updateData.position = validationResult.data.position;
    }
    if (validationResult.data.dateOfBirth !== undefined) {
      updateData.dateOfBirth = validationResult.data.dateOfBirth;
    }
    if (validationResult.data.teamId !== undefined) {
      updateData.teamId = validationResult.data.teamId || null;
    }
    if (validationResult.data.image !== undefined) {
      updateData.image = validationResult.data.image || null;
    }
    if (validationResult.data.rating !== undefined) {
      updateData.rating = validationResult.data.rating;
    }
    if (validationResult.data.marketValue !== undefined) {
      updateData.marketValue = validationResult.data.marketValue !== null 
        ? new Prisma.Decimal(validationResult.data.marketValue)
        : null;
    }
    if (validationResult.data.contractExpires !== undefined) {
      updateData.contractExpires = validationResult.data.contractExpires || null;
    }
    if (validationResult.data.totalMatches !== undefined) {
      updateData.totalMatches = validationResult.data.totalMatches;
    }
    if (validationResult.data.totalGoals !== undefined) {
      updateData.totalGoals = validationResult.data.totalGoals;
    }
    if (validationResult.data.totalAssists !== undefined) {
      updateData.totalAssists = validationResult.data.totalAssists;
    }
    if (validationResult.data.totalMinutes !== undefined) {
      updateData.totalMinutes = validationResult.data.totalMinutes;
    }
    if (validationResult.data.videoLinks !== undefined) {
      updateData.videoLinks = validationResult.data.videoLinks;
    }

    // Update player (last-write-wins strategy)
    const updatedPlayer = await prisma.player.update({
      where: { id },
      data: updateData,
    });

    // Log audit action
    logger.info(
      {
        action: "player.updated",
        playerId: updatedPlayer.id,
        adminId: session.user.id,
        data: {
          before: previousValues,
          after: {
            firstName: updatedPlayer.firstName,
            lastName: updatedPlayer.lastName,
            position: updatedPlayer.position,
          },
        },
      },
      "Player updated by admin"
    );

    // Format response with ISO date strings
    return NextResponse.json({
      id: updatedPlayer.id,
      firstName: updatedPlayer.firstName,
      lastName: updatedPlayer.lastName,
      position: updatedPlayer.position,
      dateOfBirth: updatedPlayer.dateOfBirth.toISOString().split("T")[0],
      teamId: updatedPlayer.teamId,
      image: updatedPlayer.image,
      rating: updatedPlayer.rating,
      totalMatches: updatedPlayer.totalMatches,
      totalGoals: updatedPlayer.totalGoals,
      totalAssists: updatedPlayer.totalAssists,
      totalMinutes: updatedPlayer.totalMinutes,
      videoLinks: updatedPlayer.videoLinks,
      createdAt: updatedPlayer.createdAt.toISOString(),
      updatedAt: updatedPlayer.updatedAt.toISOString(),
    });
  } catch (error) {
    logger.error({ error }, "Ошибка обновления игрока");

    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/players/[id]
 * Delete player
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Check if player exists
    const existingPlayer = await prisma.player.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        position: true,
      },
    });

    if (!existingPlayer) {
      return NextResponse.json(
        { error: "Игрок не найден" },
        { status: 404 }
      );
    }

    // Delete player
    await prisma.player.delete({
      where: { id },
    });

    // Log audit action
    logger.info(
      {
        action: "player.deleted",
        playerId: existingPlayer.id,
        adminId: session.user.id,
        data: {
          firstName: existingPlayer.firstName,
          lastName: existingPlayer.lastName,
          position: existingPlayer.position,
        },
      },
      "Player deleted by admin"
    );

    return NextResponse.json({
      success: true,
      message: "Игрок удалён",
    });
  } catch (error) {
    logger.error({ error }, "Ошибка удаления игрока");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}



