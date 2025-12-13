import { auth } from "@/lib/auth";
import { verifyUserHasAnyRole } from "@/lib/auth/roles";
import { Role, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import { createPlayerSchema } from "@/lib/validations/player";

/**
 * POST /api/admin/players
 * Create new player
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

    // Get user with role and teamId in one query
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, isActive: true, teamId: true },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    // Check if user has required role
    if (![Role.ADMIN, Role.COACH].includes(user.role)) {
      return NextResponse.json(
        { error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body (validation schema will handle string to Date conversion)
    const validationResult = createPlayerSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Некорректные данные" },
        { status: 400 }
      );
    }

    const {
      firstName,
      lastName,
      position,
      dateOfBirth,
      teamId,
      image,
      marketValue,
      contractExpires,
      totalMatches = 0,
      totalGoals = 0,
      totalAssists = 0,
      totalMinutes = 0,
      videoLinks = [],
    } = validationResult.data;

    // COACH can only create players in their own team
    if (user.role === Role.COACH) {
      if (!teamId || teamId !== user.teamId) {
        return NextResponse.json(
          { error: "Тренер может создавать игроков только в своей команде" },
          { status: 403 }
        );
      }
    }

    // Create player (statistics default to 0, videoLinks default to [])
    const player = await prisma.player.create({
      data: {
        firstName,
        lastName,
        position,
        dateOfBirth,
        teamId: teamId || null,
        image: image || null,
        marketValue: marketValue ? new Prisma.Decimal(marketValue) : null,
        contractExpires: contractExpires || null,
        totalMatches,
        totalGoals,
        totalAssists,
        totalMinutes,
        videoLinks,
      },
    });

    // Log audit action
    logger.info(
      {
        action: "player.created",
        playerId: player.id,
        userId: session.user.id,
        userRole: user.role,
        data: { firstName, lastName, position, teamId },
      },
      `Player created by ${user.role}`
    );

    // Format response with ISO date strings
    return NextResponse.json(
      {
        id: player.id,
        firstName: player.firstName,
        lastName: player.lastName,
        position: player.position,
        dateOfBirth: player.dateOfBirth.toISOString().split("T")[0], // ISO date only
        teamId: player.teamId,
        image: player.image,
        totalMatches: player.totalMatches,
        totalGoals: player.totalGoals,
        totalAssists: player.totalAssists,
        totalMinutes: player.totalMinutes,
        videoLinks: player.videoLinks,
        createdAt: player.createdAt.toISOString(),
        updatedAt: player.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error({ error }, "Ошибка создания игрока");

    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

