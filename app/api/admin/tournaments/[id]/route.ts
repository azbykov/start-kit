import { auth } from "@/lib/auth";
import { verifyUserRole } from "@/lib/auth/roles";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import { updateTournamentSchema } from "@/lib/validations/tournament";
import { Prisma } from "@prisma/client";

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
      return NextResponse.json(
        {
          error: "Проверьте правильность заполнения полей",
          fieldErrors: validationResult.error.flatten().fieldErrors,
        },
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
      status: existingTournament.status,
    };

    const updateData: any = {};

    if (validationResult.data.name !== undefined) {
      updateData.name = validationResult.data.name;
    }
    if (validationResult.data.organizer !== undefined) {
      updateData.organizer = validationResult.data.organizer || null;
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
    if (validationResult.data.sport !== undefined) {
      updateData.sport = validationResult.data.sport || null;
    }
    if (validationResult.data.format !== undefined) {
      updateData.format = validationResult.data.format || null;
    }
    if (validationResult.data.gender !== undefined) {
      updateData.gender = validationResult.data.gender || null;
    }
    if (validationResult.data.ageGroup !== undefined) {
      updateData.ageGroup = validationResult.data.ageGroup || null;
    }
    if (validationResult.data.birthYearFrom !== undefined) {
      updateData.birthYearFrom = validationResult.data.birthYearFrom ?? null;
    }
    if (validationResult.data.birthYearTo !== undefined) {
      updateData.birthYearTo = validationResult.data.birthYearTo ?? null;
    }
    if (validationResult.data.status !== undefined) {
      updateData.status = validationResult.data.status;
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
            status: updatedTournament.status,
          },
        },
      },
      "Tournament updated by admin"
    );

    // Format response with ISO date strings
    return NextResponse.json({
      id: updatedTournament.id,
      name: updatedTournament.name,
      organizer: updatedTournament.organizer,
      description: updatedTournament.description,
      season: updatedTournament.season,
      location: updatedTournament.location,
      sport: updatedTournament.sport,
      format: updatedTournament.format,
      gender: updatedTournament.gender,
      ageGroup: updatedTournament.ageGroup,
      birthYearFrom: updatedTournament.birthYearFrom,
      birthYearTo: updatedTournament.birthYearTo,
      status: updatedTournament.status,
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
    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        {
          error:
            "Схема Prisma не обновлена. Выполните `npm run db:push` и перезапустите сервер разработки.",
        },
        { status: 500 }
      );
    }

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

