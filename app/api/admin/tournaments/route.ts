import { auth } from "@/lib/auth";
import { verifyUserRole } from "@/lib/auth/roles";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import { createTournamentSchema } from "@/lib/validations/tournament";

/**
 * POST /api/admin/tournaments
 * Create new tournament
 */
export async function POST(request: NextRequest) {
  try {
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
    const validationResult = createTournamentSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Некорректные данные" },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      season,
      location,
      logo,
      startDate,
      endDate,
      isActive = true,
    } = validationResult.data;

    // Create tournament
    const tournament = await prisma.tournament.create({
      data: {
        name,
        description: description || null,
        season: season || null,
        location: location || null,
        logo: logo || null,
        startDate: startDate || null,
        endDate: endDate || null,
        isActive,
      },
    });

    // Log audit action
    logger.info(
      {
        action: "tournament.created",
        tournamentId: tournament.id,
        adminId: session.user.id,
        data: { name, season },
      },
      "Tournament created by admin"
    );

    // Format response with ISO date strings
    return NextResponse.json(
      {
        id: tournament.id,
        name: tournament.name,
        description: tournament.description,
        season: tournament.season,
        location: tournament.location,
        logo: tournament.logo,
        startDate: tournament.startDate
          ? tournament.startDate.toISOString().split("T")[0]
          : null,
        endDate: tournament.endDate
          ? tournament.endDate.toISOString().split("T")[0]
          : null,
        isActive: tournament.isActive,
        createdAt: tournament.createdAt.toISOString(),
        updatedAt: tournament.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error({ error }, "Ошибка создания турнира");

    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

