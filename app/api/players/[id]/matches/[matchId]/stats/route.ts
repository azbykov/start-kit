import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

/**
 * GET /api/players/[id]/matches/[matchId]/stats
 * Get detailed statistics for a player in a specific match (public - no authentication required)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; matchId: string }> }
) {
  try {
    const { id: playerId, matchId } = await params;

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

    // Check if match exists and get match info
    const match = await prisma.match.findUnique({
      where: { id: matchId },
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
            logo: true,
          },
        },
      },
    });

    if (!match) {
      return NextResponse.json(
        { error: "Матч не найден" },
        { status: 404 }
      );
    }

    // Get player statistics for this match
    const matchPlayer = await prisma.matchPlayer.findFirst({
      where: {
        playerId,
        matchId,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    if (!matchPlayer) {
      return NextResponse.json(
        { error: "Игрок не участвовал в этом матче" },
        { status: 404 }
      );
    }

    // Get all events for this player in this match
    const events = await prisma.matchEvent.findMany({
      where: {
        playerId,
        matchId,
      },
      include: {
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

    // Format events
    const formattedEvents = events.map((event) => ({
      id: event.id,
      eventId: event.eventId,
      subEventId: event.subEventId,
      eventName: event.eventName,
      subEventName: event.subEventName,
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
    }));

    // Group events by period
    const eventsByPeriod = {
      "1H": formattedEvents.filter((e) => e.matchPeriod === "1H"),
      "2H": formattedEvents.filter((e) => e.matchPeriod === "2H"),
      ET1: formattedEvents.filter((e) => e.matchPeriod === "ET1"),
      ET2: formattedEvents.filter((e) => e.matchPeriod === "ET2"),
      P: formattedEvents.filter((e) => e.matchPeriod === "P"),
    };

    // Helper function to check if event is successful (tagId 1801 is typically "successful")
    const isSuccessful = (event: typeof formattedEvents[0]) => {
      return event.tags.some((tag) => tag.tagId === 1801);
    };

    // Helper function to check event type by name
    const isEventType = (event: typeof formattedEvents[0], types: string[]) => {
      const eventNameLower = event.eventName.toLowerCase();
      return types.some((type) => eventNameLower.includes(type.toLowerCase()));
    };

    // Calculate statistics by period
    const calculatePeriodStats = (periodEvents: typeof formattedEvents) => {
      const shots = periodEvents.filter((e) =>
        isEventType(e, ["shot", "удар", "goal", "гол"])
      );
      const shotsOnTarget = shots.filter((e) =>
        e.tags.some((tag) => tag.tagId === 101) || isSuccessful(e)
      );
      const shotsFromBox = shots.filter((e) =>
        e.startX !== null &&
        e.startY !== null &&
        e.startX >= 50 &&
        e.startX <= 100 &&
        e.startY >= 20 &&
        e.startY <= 80
      );
      const shotsFromOutside = shots.filter(
        (e) => !shotsFromBox.includes(e)
      );

      const passes = periodEvents.filter((e) =>
        isEventType(e, ["pass", "передача"])
      );
      const successfulPasses = passes.filter(isSuccessful);
      const crosses = passes.filter((e) =>
        isEventType(e, ["cross", "кросс"]) ||
        e.tags.some((tag) => tag.tagId === 2)
      );
      const forwardPasses = passes.filter((e) =>
        e.startX !== null &&
        e.endX !== null &&
        e.endX > e.startX
      );
      const backwardPasses = passes.filter((e) =>
        e.startX !== null &&
        e.endX !== null &&
        e.endX < e.startX
      );

      const goals = periodEvents.filter((e) =>
        isEventType(e, ["goal", "гол"])
      );
      const assists = periodEvents.filter((e) =>
        isEventType(e, ["assist", "ассист"])
      );
      const fouls = periodEvents.filter((e) =>
        isEventType(e, ["foul", "фол"])
      );
      const foulsSuffered = fouls.filter((e) =>
        e.tags.some((tag) => tag.tagId === 1701)
      );
      const duels = periodEvents.filter((e) =>
        isEventType(e, ["duel", "единоборство"])
      );
      const successfulDuels = duels.filter(isSuccessful);
      const aerialDuels = duels.filter((e) =>
        e.tags.some((tag) => tag.tagId === 15)
      );
      const groundDuels = duels.filter((e) => !aerialDuels.includes(e));
      const tackles = periodEvents.filter((e) =>
        isEventType(e, ["tackle", "отбор"])
      );
      const dribbles = periodEvents.filter((e) =>
        isEventType(e, ["dribble", "дриблинг"])
      );
      const successfulDribbles = dribbles.filter(isSuccessful);
      const interceptions = periodEvents.filter((e) =>
        isEventType(e, ["interception", "перехват"])
      );
      const recoveries = periodEvents.filter((e) =>
        isEventType(e, ["recovery", "подбор"])
      );

      return {
        totalEvents: periodEvents.length,
        shots: shots.length,
        shotsOnTarget: shotsOnTarget.length,
        shotsFromBox: shotsFromBox.length,
        shotsFromOutside: shotsFromOutside.length,
        passes: passes.length,
        successfulPasses: successfulPasses.length,
        crosses: crosses.length,
        forwardPasses: forwardPasses.length,
        backwardPasses: backwardPasses.length,
        goals: goals.length,
        assists: assists.length,
        fouls: fouls.length,
        foulsSuffered: foulsSuffered.length,
        duels: duels.length,
        successfulDuels: successfulDuels.length,
        aerialDuels: aerialDuels.length,
        groundDuels: groundDuels.length,
        tackles: tackles.length,
        dribbles: dribbles.length,
        successfulDribbles: successfulDribbles.length,
        interceptions: interceptions.length,
        recoveries: recoveries.length,
      };
    };

    const statsByPeriod = {
      "1H": calculatePeriodStats(eventsByPeriod["1H"]),
      "2H": calculatePeriodStats(eventsByPeriod["2H"]),
      total: calculatePeriodStats(formattedEvents),
    };

    return NextResponse.json({
      match: {
        id: match.id,
        date: match.date.toISOString(),
        time: match.time,
        stadium: match.stadium,
        status: match.status,
        homeTeam: {
          id: match.homeTeam.id,
          name: match.homeTeam.name,
          logo: match.homeTeam.logo,
        },
        awayTeam: {
          id: match.awayTeam.id,
          name: match.awayTeam.name,
          logo: match.awayTeam.logo,
        },
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        tournament: match.tournament
          ? {
              id: match.tournament.id,
              name: match.tournament.name,
              logo: match.tournament.logo,
            }
          : null,
      },
      playerStats: {
        goals: matchPlayer.goals,
        assists: matchPlayer.assists,
        ownGoals: matchPlayer.ownGoals,
        yellowCards: matchPlayer.yellowCards,
        redCards: matchPlayer.redCards,
        minutesPlayed: matchPlayer.minutesPlayed,
        isStarter: matchPlayer.isStarter,
      },
      team: {
        id: matchPlayer.team.id,
        name: matchPlayer.team.name,
        logo: matchPlayer.team.logo,
      },
      events: formattedEvents,
      eventsByPeriod,
      statisticsByPeriod: statsByPeriod,
    });
  } catch (error) {
    logger.error({ error }, "Ошибка получения статистики игрока за матч");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
