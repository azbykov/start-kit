import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

/**
 * GET /api/matches/[id]/events
 * Get events for a match (public - no authentication required)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if match exists
    const match = await prisma.match.findUnique({
      where: { id },
    });

    if (!match) {
      return NextResponse.json(
        { error: "Матч не найден" },
        { status: 404 }
      );
    }

    // Fetch match events
    const events = await prisma.matchEvent.findMany({
      where: { matchId: id },
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
      orderBy: [
        { matchPeriod: "asc" },
        { eventSec: "asc" },
      ],
    });

    // Format response
    const formattedEvents = events.map((event) => ({
      id: event.id,
      matchId: event.matchId,
      eventId: event.eventId,
      subEventId: event.subEventId,
      eventName: event.eventName,
      subEventName: event.subEventName,
      player: event.player
        ? {
            id: event.player.id,
            name: `${event.player.firstName} ${event.player.lastName}`,
            image: event.player.image,
          }
        : null,
      team: {
        id: event.team.id,
        name: event.team.name,
        logo: event.team.logo,
      },
      matchPeriod: event.matchPeriod,
      eventSec: Number(event.eventSec),
      startX: event.startX ? Number(event.startX) : null,
      startY: event.startY ? Number(event.startY) : null,
      endX: event.endX ? Number(event.endX) : null,
      endY: event.endY ? Number(event.endY) : null,
      tags: event.tags.map((tag) => ({
        id: tag.id,
        tagId: tag.tagId,
      })),
      createdAt: event.createdAt.toISOString(),
    }));

    return NextResponse.json({
      events: formattedEvents,
    });
  } catch (error) {
    logger.error({ error }, "Ошибка получения событий матча");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}


