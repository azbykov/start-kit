import { auth } from "@/lib/auth";
import { verifyUserCanManageTeam, verifyUserRole } from "@/lib/auth/roles";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import { updateTeamSchema } from "@/lib/validations/team";

/**
 * PATCH /api/admin/teams/[id]
 * Update team data
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

    const hasAccess = await verifyUserCanManageTeam(id);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = updateTeamSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Некорректные данные" },
        { status: 400 }
      );
    }

    // Check if team exists
    const existingTeam = await prisma.team.findUnique({
      where: { id },
    });

    if (!existingTeam) {
      return NextResponse.json(
        { error: "Команда не найдена" },
        { status: 404 }
      );
    }

    // Get previous values for audit log
    const previousValues = {
      name: existingTeam.name,
      city: existingTeam.city,
    };

    const updateData: any = {};

    if (validationResult.data.name !== undefined) {
      updateData.name = validationResult.data.name;
    }
    if (validationResult.data.logo !== undefined) {
      updateData.logo = validationResult.data.logo || null;
    }
    if (validationResult.data.coach !== undefined) {
      updateData.coach = validationResult.data.coach || null;
    }
    if (validationResult.data.city !== undefined) {
      updateData.city = validationResult.data.city || null;
    }
    if (validationResult.data.country !== undefined) {
      updateData.country = validationResult.data.country || null;
    }
    if (validationResult.data.isActive !== undefined) {
      updateData.isActive = validationResult.data.isActive;
    }

    // Update team (last-write-wins strategy)
    const updatedTeam = await prisma.team.update({
      where: { id },
      data: updateData,
    });

    // Log audit action
    logger.info(
      {
        action: "team.updated",
        teamId: updatedTeam.id,
        adminId: session.user.id,
        data: {
          before: previousValues,
          after: {
            name: updatedTeam.name,
            city: updatedTeam.city,
          },
        },
      },
      "Team updated by admin"
    );

    // Format response
    return NextResponse.json({
      id: updatedTeam.id,
      name: updatedTeam.name,
      logo: updatedTeam.logo,
      coach: updatedTeam.coach,
      city: updatedTeam.city,
      country: updatedTeam.country,
      isActive: updatedTeam.isActive,
      createdAt: updatedTeam.createdAt.toISOString(),
      updatedAt: updatedTeam.updatedAt.toISOString(),
    });
  } catch (error) {
    logger.error({ error }, "Ошибка обновления команды");

    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/teams/[id]
 * Delete team
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

    const hasAccess = await verifyUserCanManageTeam(id);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    // Check if team exists and get player count
    const existingTeam = await prisma.team.findUnique({
      where: { id },
      include: {
        _count: {
          select: { players: true },
        },
      },
      select: {
        id: true,
        name: true,
        city: true,
        _count: {
          select: {
            players: true,
          },
        },
      },
    });

    if (!existingTeam) {
      return NextResponse.json(
        { error: "Команда не найдена" },
        { status: 404 }
      );
    }

    // Check if team has players - block deletion if it does
    if (existingTeam._count.players > 0) {
      return NextResponse.json(
        {
          error: `Невозможно удалить команду: в ней состоит ${existingTeam._count.players} игроков. Сначала удалите или переведите всех игроков.`,
        },
        { status: 400 }
      );
    }

    // Delete team
    await prisma.team.delete({
      where: { id },
    });

    // Log audit action
    logger.info(
      {
        action: "team.deleted",
        teamId: existingTeam.id,
        adminId: session.user.id,
        data: {
          name: existingTeam.name,
          city: existingTeam.city,
        },
      },
      "Team deleted by admin"
    );

    return NextResponse.json({
      success: true,
      message: "Команда удалена",
    });
  } catch (error) {
    logger.error({ error }, "Ошибка удаления команды");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

