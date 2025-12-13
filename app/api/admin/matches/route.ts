import { auth } from "@/lib/auth";
import { verifyUserRole } from "@/lib/auth/roles";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import { createMatchSchema } from "@/lib/validations/match";

/**
 * POST /api/admin/matches
 * Create new match
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
    const validationResult = createMatchSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Некорректные данные" },
        { status: 400 }
      );
    }

    const {
      date,
      time,
      stadium,
      status,
      homeTeamId,
      awayTeamId,
      homeScore,
      awayScore,
      tournamentId,
    } = validationResult.data;

    // Verify teams exist
    const [homeTeam, awayTeam] = await Promise.all([
      prisma.team.findUnique({ where: { id: homeTeamId } }),
      prisma.team.findUnique({ where: { id: awayTeamId } }),
    ]);

    if (!homeTeam) {
      return NextResponse.json(
        { error: "Команда хозяев не найдена" },
        { status: 404 }
      );
    }

    if (!awayTeam) {
      return NextResponse.json(
        { error: "Команда гостей не найдена" },
        { status: 404 }
      );
    }

    // Verify tournament exists if provided
    if (tournamentId) {
      const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
      });
      if (!tournament) {
        return NextResponse.json(
          { error: "Турнир не найден" },
          { status: 404 }
        );
      }
    }

    // Create match
    const match = await prisma.match.create({
      data: {
        date,
        time: time || null,
        stadium: stadium || null,
        status,
        homeTeamId,
        awayTeamId,
        homeScore: homeScore || null,
        awayScore: awayScore || null,
        tournamentId: tournamentId || null,
      },
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        tournament: {
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
        action: "match.created",
        matchId: match.id,
        adminId: session.user.id,
        data: {
          date: match.date.toISOString(),
          homeTeam: homeTeam.name,
          awayTeam: awayTeam.name,
        },
      },
      "Match created by admin"
    );

    // Format response
    return NextResponse.json(
      {
        id: match.id,
        date: match.date.toISOString().split("T")[0],
        time: match.time,
        stadium: match.stadium,
        status: match.status,
        homeTeamId: match.homeTeamId,
        homeTeamName: match.homeTeam.name,
        homeTeamLogo: match.homeTeam.logo,
        awayTeamId: match.awayTeamId,
        awayTeamName: match.awayTeam.name,
        awayTeamLogo: match.awayTeam.logo,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        tournamentId: match.tournamentId,
        tournamentName: match.tournament?.name || null,
        createdAt: match.createdAt.toISOString(),
        updatedAt: match.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error({ error }, "Ошибка создания матча");

    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}











