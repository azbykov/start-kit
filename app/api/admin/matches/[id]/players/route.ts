import { auth } from "@/lib/auth";
import { verifyUserRole } from "@/lib/auth/roles";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import { addMatchPlayerSchema } from "@/lib/validations/match";

/**
 * POST /api/admin/matches/[id]/players
 * Add player to match
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params;
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
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return NextResponse.json(
        { error: "Матч не найден" },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validationResult = addMatchPlayerSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Некорректные данные" },
        { status: 400 }
      );
    }

    const {
      playerId,
      teamId,
      goals: goalsStr,
      assists: assistsStr,
      yellowCards: yellowCardsStr,
      redCards: redCardsStr,
      minutesPlayed: minutesPlayedStr,
      isStarter,
    } = validationResult.data;

    // Convert strings to numbers
    const goals = parseInt(goalsStr, 10) || 0;
    const assists = parseInt(assistsStr, 10) || 0;
    const yellowCards = parseInt(yellowCardsStr, 10) || 0;
    const redCards = parseInt(redCardsStr, 10) || 0;
    const minutesPlayed = parseInt(minutesPlayedStr, 10) || 0;

    // Verify player exists and belongs to one of the match teams
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        team: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!player) {
      return NextResponse.json(
        { error: "Игрок не найден" },
        { status: 404 }
      );
    }

    // Verify team is one of the match teams
    if (teamId !== match.homeTeamId && teamId !== match.awayTeamId) {
      return NextResponse.json(
        { error: "Игрок должен быть из одной из команд матча" },
        { status: 400 }
      );
    }

    // Verify player belongs to the specified team
    if (player.teamId !== teamId) {
      return NextResponse.json(
        { error: "Игрок не принадлежит указанной команде" },
        { status: 400 }
      );
    }

    // Check if player is already in the match
    const existingMatchPlayer = await prisma.matchPlayer.findUnique({
      where: {
        matchId_playerId: {
          matchId,
          playerId,
        },
      },
    });

    if (existingMatchPlayer) {
      return NextResponse.json(
        { error: "Игрок уже добавлен в матч" },
        { status: 400 }
      );
    }

    // Create match player
    const matchPlayer = await prisma.matchPlayer.create({
      data: {
        matchId,
        playerId,
        teamId,
        goals,
        assists,
        yellowCards,
        redCards,
        minutesPlayed,
        isStarter,
      },
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
        team: {
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
        action: "match.player.added",
        matchId,
        playerId,
        adminId: session.user.id,
      },
      "Player added to match by admin"
    );

    // Format response
    return NextResponse.json(
      {
        id: matchPlayer.id,
        matchId: matchPlayer.matchId,
        playerId: matchPlayer.playerId,
        playerName: `${matchPlayer.player.firstName} ${matchPlayer.player.lastName}`,
        playerImage: matchPlayer.player.image,
        teamId: matchPlayer.teamId,
        teamName: matchPlayer.team.name,
        goals: matchPlayer.goals,
        assists: matchPlayer.assists,
        yellowCards: matchPlayer.yellowCards,
        redCards: matchPlayer.redCards,
        minutesPlayed: matchPlayer.minutesPlayed,
        isStarter: matchPlayer.isStarter,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error({ error }, "Ошибка добавления игрока в матч");

    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}















