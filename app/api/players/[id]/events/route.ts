import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

/**
 * GET /api/players/[id]/events
 * Get all events for a player across all matches (public - no authentication required)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: playerId } = await params;

    // Check if player exists
    const player = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!player) {
      return NextResponse.json(
        { error: "Игрок не найден" },
        { status: 404 }
      );
    }

    // Get all events for this player
    const events = await prisma.matchEvent.findMany({
      where: { playerId },
      include: {
        match: {
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
                shortName: true,
                logo: true,
              },
            },
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
        { match: { date: "desc" } },
        { matchPeriod: "asc" },
        { eventSec: "asc" },
      ],
    });

    // Format response
    const formattedEvents = events.map((event) => ({
      id: event.id,
      matchId: event.matchId,
      match: {
        id: event.match.id,
        date: event.match.date.toISOString(),
        homeTeam: {
          id: event.match.homeTeam.id,
          name: event.match.homeTeam.name,
          logo: event.match.homeTeam.logo,
        },
        awayTeam: {
          id: event.match.awayTeam.id,
          name: event.match.awayTeam.name,
          logo: event.match.awayTeam.logo,
        },
        tournament: event.match.tournament
          ? {
              id: event.match.tournament.id,
              name: event.match.tournament.name,
              shortName: event.match.tournament.shortName,
              logo: event.match.tournament.logo,
            }
          : null,
      },
      eventId: event.eventId,
      subEventId: event.subEventId,
      eventName: event.eventName,
      subEventName: event.subEventName,
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

    // Aggregate events by type
    const eventsByType = new Map<
      string,
      {
        eventName: string;
        subEventName: string | null;
        count: number;
        events: typeof formattedEvents;
      }
    >();

    formattedEvents.forEach((event) => {
      const key = `${event.eventId}-${event.subEventId || "null"}`;
      const existing = eventsByType.get(key);
      if (existing) {
        existing.count += 1;
        existing.events.push(event);
      } else {
        eventsByType.set(key, {
          eventName: event.eventName,
          subEventName: event.subEventName,
          count: 1,
          events: [event],
        });
      }
    });

    // Convert to array and sort by count (desc)
    const statistics = Array.from(eventsByType.values()).sort(
      (a, b) => b.count - a.count
    );

    return NextResponse.json({
      events: formattedEvents,
      statistics,
    });
  } catch (error) {
    logger.error({ error }, "Ошибка получения событий игрока");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
