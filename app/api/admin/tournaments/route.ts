import { auth } from "@/lib/auth";
import { verifyUserRole } from "@/lib/auth/roles";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import { createTournamentSchema } from "@/lib/validations/tournament";
import { Prisma } from "@prisma/client";

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
      return NextResponse.json(
        {
          error: "Проверьте правильность заполнения полей",
          fieldErrors: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      name,
      organizer,
      description,
      season,
      location,
      sport,
      format,
      gender,
      ageGroup,
      birthYearFrom,
      birthYearTo,
      status,
      logo,
      startDate,
      endDate,
      isActive = true,
    } = validationResult.data;

    // Create tournament
    const tournament = await prisma.tournament.create({
      data: {
        name,
        organizer: organizer || null,
        description: description || null,
        season: season || null,
        location: location || null,
        sport: sport || null,
        format: format || null,
        gender: gender || null,
        ageGroup: ageGroup || null,
        birthYearFrom: birthYearFrom ?? null,
        birthYearTo: birthYearTo ?? null,
        status: status || "ACTIVE",
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
        data: { name, season, status },
      },
      "Tournament created by admin"
    );

    // Format response with ISO date strings
    return NextResponse.json(
      {
        id: tournament.id,
        name: tournament.name,
        organizer: tournament.organizer,
        description: tournament.description,
        season: tournament.season,
        location: tournament.location,
        sport: tournament.sport,
        format: tournament.format,
        gender: tournament.gender,
        ageGroup: tournament.ageGroup,
        birthYearFrom: tournament.birthYearFrom,
        birthYearTo: tournament.birthYearTo,
        status: tournament.status,
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
    // Prisma schema/client mismatch (common during dev after schema change)
    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        {
          error:
            "Схема Prisma не обновлена. Выполните `npm run db:push` и перезапустите сервер разработки.",
        },
        { status: 500 }
      );
    }

    logger.error({ error }, "Ошибка создания турнира");

    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

