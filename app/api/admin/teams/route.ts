import { auth } from "@/lib/auth";
import { verifyUserRole } from "@/lib/auth/roles";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import { createTeamSchema } from "@/lib/validations/team";

/**
 * POST /api/admin/teams
 * Create new team
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

    // Validate request body
    const validationResult = createTeamSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Некорректные данные" },
        { status: 400 }
      );
    }

    const {
      name,
      logo,
      coach,
      city,
      country,
      isActive = true,
    } = validationResult.data;

    // Create team
    const team = await prisma.team.create({
      data: {
        name,
        logo: logo || null,
        coach: coach || null,
        city: city || null,
        country: country || null,
        isActive,
      },
    });

    // Log audit action
    logger.info(
      {
        action: "team.created",
        teamId: team.id,
        adminId: session.user.id,
        data: { name, city },
      },
      "Team created by admin"
    );

    // Format response
    return NextResponse.json(
      {
        id: team.id,
        name: team.name,
        logo: team.logo,
        coach: team.coach,
        city: team.city,
        country: team.country,
        isActive: team.isActive,
        createdAt: team.createdAt.toISOString(),
        updatedAt: team.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error({ error }, "Ошибка создания команды");

    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

