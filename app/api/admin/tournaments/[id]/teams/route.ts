import { auth } from "@/lib/auth";
import { verifyUserRole } from "@/lib/auth/roles";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

/**
 * GET /api/admin/tournaments/[id]/teams
 * Get list of teams participating in tournament
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params;
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
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Турнир не найден" },
        { status: 404 }
      );
    }

    // Get teams in tournament
    const tournamentTeams = await prisma.tournamentTeam.findMany({
      where: { tournamentId },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
            city: true,
            country: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      teams: tournamentTeams.map((tt) => tt.team),
    });
  } catch (error) {
    logger.error({ error }, "Ошибка получения команд турнира");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/tournaments/[id]/teams
 * Add team to tournament
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params;
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
    const { teamId } = body;

    if (!teamId || typeof teamId !== "string") {
      return NextResponse.json(
        { error: "ID команды обязателен" },
        { status: 400 }
      );
    }

    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Турнир не найден" },
        { status: 404 }
      );
    }

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

    // Check if team is already in tournament
    const existing = await prisma.tournamentTeam.findUnique({
      where: {
        tournamentId_teamId: {
          tournamentId,
          teamId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Команда уже участвует в турнире" },
        { status: 400 }
      );
    }

    // Add team to tournament
    await prisma.tournamentTeam.create({
      data: {
        tournamentId,
        teamId,
      },
    });

    logger.info(
      {
        action: "tournament.team.added",
        tournamentId,
        teamId,
        adminId: session.user.id,
      },
      "Team added to tournament"
    );

    return NextResponse.json(
      { success: true, message: "Команда добавлена в турнир" },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Команда уже участвует в турнире" },
        { status: 400 }
      );
    }
    logger.error({ error }, "Ошибка добавления команды в турнир");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/tournaments/[id]/teams?teamId=xxx
 * Remove team from tournament
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params;
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

    const searchParams = request.nextUrl.searchParams;
    const teamId = searchParams.get("teamId");

    if (!teamId) {
      return NextResponse.json(
        { error: "ID команды обязателен (query parameter teamId)" },
        { status: 400 }
      );
    }

    // Check if relation exists
    const existing = await prisma.tournamentTeam.findUnique({
      where: {
        tournamentId_teamId: {
          tournamentId,
          teamId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Команда не участвует в турнире" },
        { status: 404 }
      );
    }

    // Remove team from tournament
    await prisma.tournamentTeam.delete({
      where: {
        tournamentId_teamId: {
          tournamentId,
          teamId,
        },
      },
    });

    logger.info(
      {
        action: "tournament.team.removed",
        tournamentId,
        teamId,
        adminId: session.user.id,
      },
      "Team removed from tournament"
    );

    return NextResponse.json({
      success: true,
      message: "Команда удалена из турнира",
    });
  } catch (error) {
    logger.error({ error }, "Ошибка удаления команды из турнира");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

