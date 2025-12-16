import { auth } from "@/lib/auth";
import { verifyUserRole } from "@/lib/auth/roles";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import { updateMatchSchema } from "@/lib/validations/match";

/**
 * PATCH /api/admin/matches/[id]
 * Update match data
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

    // Validate request body
    const validationResult = updateMatchSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Некорректные данные" },
        { status: 400 }
      );
    }

    // Check if match exists
    const existingMatch = await prisma.match.findUnique({
      where: { id },
    });

    if (!existingMatch) {
      return NextResponse.json(
        { error: "Матч не найден" },
        { status: 404 }
      );
    }

    // Verify teams exist if provided
    if (validationResult.data.homeTeamId) {
      const homeTeam = await prisma.team.findUnique({
        where: { id: validationResult.data.homeTeamId },
      });
      if (!homeTeam) {
        return NextResponse.json(
          { error: "Команда хозяев не найдена" },
          { status: 404 }
        );
      }
    }

    if (validationResult.data.awayTeamId) {
      const awayTeam = await prisma.team.findUnique({
        where: { id: validationResult.data.awayTeamId },
      });
      if (!awayTeam) {
        return NextResponse.json(
          { error: "Команда гостей не найдена" },
          { status: 404 }
        );
      }
    }

    // Verify tournament exists if provided
    if (validationResult.data.tournamentId !== undefined) {
      if (validationResult.data.tournamentId) {
        const tournament = await prisma.tournament.findUnique({
          where: { id: validationResult.data.tournamentId },
        });
        if (!tournament) {
          return NextResponse.json(
            { error: "Турнир не найден" },
            { status: 404 }
          );
        }
      }
    }

    const updateData: any = {};

    if (validationResult.data.date !== undefined) {
      updateData.date = validationResult.data.date;
    }
    if (validationResult.data.time !== undefined) {
      updateData.time = validationResult.data.time || null;
    }
    if (validationResult.data.stadium !== undefined) {
      updateData.stadium = validationResult.data.stadium || null;
    }
    if (validationResult.data.status !== undefined) {
      updateData.status = validationResult.data.status;
    }
    if (validationResult.data.homeTeamId !== undefined) {
      updateData.homeTeamId = validationResult.data.homeTeamId;
    }
    if (validationResult.data.awayTeamId !== undefined) {
      updateData.awayTeamId = validationResult.data.awayTeamId;
    }
    if (validationResult.data.homeScore !== undefined) {
      updateData.homeScore = validationResult.data.homeScore || null;
    }
    if (validationResult.data.awayScore !== undefined) {
      updateData.awayScore = validationResult.data.awayScore || null;
    }
    if (validationResult.data.tournamentId !== undefined) {
      updateData.tournamentId = validationResult.data.tournamentId || null;
    }

    // Update match
    const updatedMatch = await prisma.match.update({
      where: { id },
      data: updateData,
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
        action: "match.updated",
        matchId: updatedMatch.id,
        adminId: session.user.id,
        data: {
          date: updatedMatch.date.toISOString(),
        },
      },
      "Match updated by admin"
    );

    // Format response
    return NextResponse.json({
      id: updatedMatch.id,
      date: updatedMatch.date.toISOString().split("T")[0],
      time: updatedMatch.time,
      stadium: updatedMatch.stadium,
      status: updatedMatch.status,
      homeTeamId: updatedMatch.homeTeamId,
      homeTeamName: updatedMatch.homeTeam.name,
      homeTeamLogo: updatedMatch.homeTeam.logo,
      awayTeamId: updatedMatch.awayTeamId,
      awayTeamName: updatedMatch.awayTeam.name,
      awayTeamLogo: updatedMatch.awayTeam.logo,
      homeScore: updatedMatch.homeScore,
      awayScore: updatedMatch.awayScore,
      tournamentId: updatedMatch.tournamentId,
      tournamentName: updatedMatch.tournament?.name || null,
      createdAt: updatedMatch.createdAt.toISOString(),
      updatedAt: updatedMatch.updatedAt.toISOString(),
    });
  } catch (error) {
    logger.error({ error }, "Ошибка обновления матча");

    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/matches/[id]
 * Delete match
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

    // Check if match exists
    const existingMatch = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: {
          select: {
            name: true,
          },
        },
        awayTeam: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!existingMatch) {
      return NextResponse.json(
        { error: "Матч не найден" },
        { status: 404 }
      );
    }

    // Delete match (cascade will delete MatchPlayer records)
    await prisma.match.delete({
      where: { id },
    });

    // Log audit action
    logger.info(
      {
        action: "match.deleted",
        matchId: existingMatch.id,
        adminId: session.user.id,
        data: {
          date: existingMatch.date.toISOString(),
          homeTeam: existingMatch.homeTeam.name,
          awayTeam: existingMatch.awayTeam.name,
        },
      },
      "Match deleted by admin"
    );

    return NextResponse.json({
      success: true,
      message: "Матч удалён",
    });
  } catch (error) {
    logger.error({ error }, "Ошибка удаления матча");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}













