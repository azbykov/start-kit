import { auth } from "@/lib/auth";
import { verifyUserRole } from "@/lib/auth/roles";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import { z } from "zod";

/**
 * Schema for adding a match event
 */
const addMatchEventSchema = z.object({
  eventId: z.number().int().min(1),
  subEventId: z.number().int().optional().nullable(),
  eventName: z.string().min(1).max(100),
  subEventName: z.string().max(100).optional().nullable(),
  playerId: z.string().optional().nullable(),
  teamId: z.string().min(1),
  matchPeriod: z.string().max(10),
  eventSec: z.number().min(0),
  startX: z.number().min(0).max(100).optional().nullable(),
  startY: z.number().min(0).max(100).optional().nullable(),
  endX: z.number().min(0).max(100).optional().nullable(),
  endY: z.number().min(0).max(100).optional().nullable(),
  tags: z.array(z.object({ tagId: z.number() })).optional().default([]),
});

/**
 * POST /api/admin/matches/[id]/events
 * Add event to match
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
    const validationResult = addMatchEventSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Некорректные данные" },
        { status: 400 }
      );
    }

    const {
      eventId,
      subEventId,
      eventName,
      subEventName,
      playerId,
      teamId,
      matchPeriod,
      eventSec,
      startX,
      startY,
      endX,
      endY,
      tags,
    } = validationResult.data;

    // Verify team is one of the match teams
    if (teamId !== match.homeTeamId && teamId !== match.awayTeamId) {
      return NextResponse.json(
        { error: "Команда должна быть одной из команд матча" },
        { status: 400 }
      );
    }

    // Verify player exists if provided
    if (playerId) {
      const player = await prisma.player.findUnique({
        where: { id: playerId },
      });

      if (!player) {
        return NextResponse.json(
          { error: "Игрок не найден" },
          { status: 404 }
        );
      }
    }

    // Create match event
    const matchEvent = await prisma.matchEvent.create({
      data: {
        matchId,
        eventId,
        subEventId: subEventId || null,
        eventName,
        subEventName: subEventName || null,
        playerId: playerId || null,
        teamId,
        matchPeriod,
        eventSec,
        startX: startX || null,
        startY: startY || null,
        endX: endX || null,
        endY: endY || null,
        tags: {
          create: tags.map((tag) => ({
            tagId: tag.tagId,
          })),
        },
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
            logo: true,
          },
        },
        tags: {
          select: {
            id: true,
            tagId: true,
          },
        },
      },
    });

    // Log audit action
    logger.info(
      {
        action: "match.event.added",
        matchId,
        eventId: matchEvent.id,
        adminId: session.user.id,
      },
      "Event added to match by admin"
    );

    // Format response
    return NextResponse.json({
      id: matchEvent.id,
      matchId: matchEvent.matchId,
      eventId: matchEvent.eventId,
      subEventId: matchEvent.subEventId,
      eventName: matchEvent.eventName,
      subEventName: matchEvent.subEventName,
      player: matchEvent.player
        ? {
            id: matchEvent.player.id,
            name: `${matchEvent.player.firstName} ${matchEvent.player.lastName}`,
            image: matchEvent.player.image,
          }
        : null,
      team: {
        id: matchEvent.team.id,
        name: matchEvent.team.name,
        logo: matchEvent.team.logo,
      },
      matchPeriod: matchEvent.matchPeriod,
      eventSec: Number(matchEvent.eventSec),
      startX: matchEvent.startX ? Number(matchEvent.startX) : null,
      startY: matchEvent.startY ? Number(matchEvent.startY) : null,
      endX: matchEvent.endX ? Number(matchEvent.endX) : null,
      endY: matchEvent.endY ? Number(matchEvent.endY) : null,
      tags: matchEvent.tags.map((tag) => ({
        id: tag.id,
        tagId: tag.tagId,
      })),
      createdAt: matchEvent.createdAt.toISOString(),
    });
  } catch (error) {
    logger.error({ error }, "Ошибка добавления события в матч");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

