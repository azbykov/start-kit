import { auth } from "@/lib/auth";
import { verifyUserRole } from "@/lib/auth/roles";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import { updateTournamentSchema } from "@/lib/validations/tournament";

/**
 * PATCH /api/admin/tournaments/[id]
 * Update tournament data
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
    const validationResult = updateTournamentSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Некорректные данные" },
        { status: 400 }
      );
    }

    // Check if tournament exists
    const existingTournament = await prisma.tournament.findUnique({
      where: { id },
    });

    if (!existingTournament) {
      return NextResponse.json(
        { error: "Турнир не найден" },
        { status: 404 }
      );
    }

    // Get previous values for audit log
    const previousValues = {
      name: existingTournament.name,
      season: existingTournament.season,
    };

    const updateData: any = {};

    if (validationResult.data.name !== undefined) {
      updateData.name = validationResult.data.name;
    }
    if (validationResult.data.description !== undefined) {
      updateData.description = validationResult.data.description || null;
    }
    if (validationResult.data.season !== undefined) {
      updateData.season = validationResult.data.season || null;
    }
    if (validationResult.data.location !== undefined) {
      updateData.location = validationResult.data.location || null;
    }
    if (validationResult.data.logo !== undefined) {
      updateData.logo = validationResult.data.logo || null;
    }
    if (validationResult.data.startDate !== undefined) {
      updateData.startDate = validationResult.data.startDate || null;
    }
    if (validationResult.data.endDate !== undefined) {
      updateData.endDate = validationResult.data.endDate || null;
    }
    if (validationResult.data.isActive !== undefined) {
      updateData.isActive = validationResult.data.isActive;
    }

    // Update tournament (last-write-wins strategy)
    const updatedTournament = await prisma.tournament.update({
      where: { id },
      data: updateData,
    });

    // Log audit action
    logger.info(
      {
        action: "tournament.updated",
        tournamentId: updatedTournament.id,
        adminId: session.user.id,
        data: {
          before: previousValues,
          after: {
            name: updatedTournament.name,
            season: updatedTournament.season,
          },
        },
      },
      "Tournament updated by admin"
    );

    // Format response with ISO date strings
    return NextResponse.json({
      id: updatedTournament.id,
      name: updatedTournament.name,
      description: updatedTournament.description,
      season: updatedTournament.season,
      location: updatedTournament.location,
      logo: updatedTournament.logo,
      startDate: updatedTournament.startDate
        ? updatedTournament.startDate.toISOString().split("T")[0]
        : null,
      endDate: updatedTournament.endDate
        ? updatedTournament.endDate.toISOString().split("T")[0]
        : null,
      isActive: updatedTournament.isActive,
      createdAt: updatedTournament.createdAt.toISOString(),
      updatedAt: updatedTournament.updatedAt.toISOString(),
    });
  } catch (error) {
    logger.error({ error }, "Ошибка обновления турнира");

    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/tournaments/[id]
 * Delete tournament
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

    // Check if tournament exists
    const existingTournament = await prisma.tournament.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        season: true,
      },
    });

    if (!existingTournament) {
      return NextResponse.json(
        { error: "Турнир не найден" },
        { status: 404 }
      );
    }

    // Delete tournament
    await prisma.tournament.delete({
      where: { id },
    });

    // Log audit action
    logger.info(
      {
        action: "tournament.deleted",
        tournamentId: existingTournament.id,
        adminId: session.user.id,
        data: {
          name: existingTournament.name,
          season: existingTournament.season,
        },
      },
      "Tournament deleted by admin"
    );

    return NextResponse.json({
      success: true,
      message: "Турнир удалён",
    });
  } catch (error) {
    logger.error({ error }, "Ошибка удаления турнира");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

