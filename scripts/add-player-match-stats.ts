import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Script to add detailed statistics for a player from "ФК Старт" team
 * Adds many quality events for one match
 */
async function main() {
  // Find team "ФК Старт"
  const startTeam = await prisma.team.findFirst({
    where: { name: "ФК Старт" },
  });

  if (!startTeam) {
    console.error("❌ Team 'ФК Старт' not found");
    return;
  }

  // Find a player from this team (preferably not goalkeeper)
  const allPlayers = await prisma.player.findMany({
    where: {
      teamId: startTeam.id,
    },
  });

  // Filter out goalkeepers
  const player = allPlayers.find(
    (p) => !p.position.includes("GK" as any)
  ) || allPlayers[0];

  if (!player) {
    console.error("❌ No suitable player found in ФК Старт");
    return;
  }

  console.log(`✅ Found player: ${player.firstName} ${player.lastName} (${player.id})`);

  // Find a finished match where this player participated
  const matchPlayer = await prisma.matchPlayer.findFirst({
    where: {
      playerId: player.id,
      match: {
        status: "FINISHED",
      },
    },
    include: {
      match: {
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      },
    },
  });

  if (!matchPlayer) {
    console.error("❌ No finished match found for this player");
    return;
  }

  const match = matchPlayer.match;
  console.log(
    `✅ Found match: ${match.homeTeam.name} vs ${match.awayTeam.name} (${match.id})`
  );

  // Check existing events for this player in this match
  const existingEvents = await prisma.matchEvent.findMany({
    where: {
      matchId: match.id,
      playerId: player.id,
    },
  });

  if (existingEvents.length > 0) {
    console.log(
      `⚠️  Match already has ${existingEvents.length} events for this player. Deleting existing events...`
    );
    // Delete existing events and their tags
    for (const event of existingEvents) {
      await prisma.matchEventTag.deleteMany({
        where: { eventId: event.id },
      });
      await prisma.matchEvent.delete({
        where: { id: event.id },
      });
    }
  }

  // Define comprehensive event types with realistic data
  const events: Array<{
    eventId: number;
    subEventId: number | null;
    eventName: string;
    subEventName: string | null;
    matchPeriod: "1H" | "2H";
    eventSec: number;
    startX: number;
    startY: number;
    endX: number | null;
    endY: number | null;
    tags: number[];
  }> = [
    // First Half Events
    // Passes (successful)
    {
      eventId: 8,
      subEventId: 85,
      eventName: "Pass",
      subEventName: "Simple pass",
      matchPeriod: "1H",
      eventSec: 120,
      startX: 45,
      startY: 50,
      endX: 55,
      endY: 52,
      tags: [1801], // Successful
    },
    {
      eventId: 8,
      subEventId: 85,
      eventName: "Pass",
      subEventName: "Simple pass",
      matchPeriod: "1H",
      eventSec: 450,
      startX: 60,
      startY: 40,
      endX: 70,
      endY: 45,
      tags: [1801], // Successful
    },
    {
      eventId: 8,
      subEventId: 85,
      eventName: "Pass",
      subEventName: "Forward pass",
      matchPeriod: "1H",
      eventSec: 780,
      startX: 50,
      startY: 50,
      endX: 65,
      endY: 48,
      tags: [1801], // Successful
    },
    {
      eventId: 8,
      subEventId: 85,
      eventName: "Pass",
      subEventName: "Cross",
      matchPeriod: "1H",
      eventSec: 1200,
      startX: 85,
      startY: 30,
      endX: 92,
      endY: 50,
      tags: [1801, 2], // Successful, Cross
    },
    {
      eventId: 8,
      subEventId: 85,
      eventName: "Pass",
      subEventName: "Simple pass",
      matchPeriod: "1H",
      eventSec: 1500,
      startX: 40,
      startY: 60,
      endX: 45,
      endY: 58,
      tags: [1801], // Successful
    },
    // Passes (unsuccessful)
    {
      eventId: 8,
      subEventId: 85,
      eventName: "Pass",
      subEventName: "Simple pass",
      matchPeriod: "1H",
      eventSec: 2100,
      startX: 55,
      startY: 50,
      endX: 65,
      endY: 55,
      tags: [], // Unsuccessful
    },
    // Shots
    {
      eventId: 2,
      subEventId: 15,
      eventName: "Shot",
      subEventName: "Shot on target",
      matchPeriod: "1H",
      eventSec: 1800,
      startX: 85,
      startY: 50,
      endX: 100,
      endY: 50,
      tags: [101], // On target
    },
    {
      eventId: 2,
      subEventId: 16,
      eventName: "Shot",
      subEventName: "Shot off target",
      matchPeriod: "1H",
      eventSec: 2400,
      startX: 80,
      startY: 45,
      endX: 100,
      endY: 30,
      tags: [], // Off target
    },
    {
      eventId: 2,
      subEventId: 15,
      eventName: "Shot",
      subEventName: "Shot on target",
      matchPeriod: "1H",
      eventSec: 2700,
      startX: 88,
      startY: 52,
      endX: 100,
      endY: 48,
      tags: [101], // On target
    },
    // Goal
    {
      eventId: 1,
      subEventId: 10,
      eventName: "Goal",
      subEventName: "Normal Goal",
      matchPeriod: "1H",
      eventSec: 1950,
      startX: 90,
      startY: 50,
      endX: 100,
      endY: 50,
      tags: [101], // On target
    },
    // Dribbles
    {
      eventId: 9,
      subEventId: 70,
      eventName: "Dribble",
      subEventName: "Dribble",
      matchPeriod: "1H",
      eventSec: 900,
      startX: 55,
      startY: 50,
      endX: 65,
      endY: 52,
      tags: [1801], // Successful
    },
    {
      eventId: 9,
      subEventId: 70,
      eventName: "Dribble",
      subEventName: "Dribble",
      matchPeriod: "1H",
      eventSec: 3300,
      startX: 70,
      startY: 45,
      endX: 75,
      endY: 48,
      tags: [1801], // Successful
    },
    {
      eventId: 9,
      subEventId: 70,
      eventName: "Dribble",
      subEventName: "Dribble",
      matchPeriod: "1H",
      eventSec: 3600,
      startX: 60,
      startY: 55,
      endX: 65,
      endY: 58,
      tags: [], // Unsuccessful
    },
    // Duels
    {
      eventId: 11,
      subEventId: null,
      eventName: "Duel",
      subEventName: "Ground duel",
      matchPeriod: "1H",
      eventSec: 600,
      startX: 50,
      startY: 50,
      endX: null,
      endY: null,
      tags: [1801], // Successful
    },
    {
      eventId: 11,
      subEventId: null,
      eventName: "Duel",
      subEventName: "Aerial duel",
      matchPeriod: "1H",
      eventSec: 1500,
      startX: 60,
      startY: 50,
      endX: null,
      endY: null,
      tags: [1801, 15], // Successful, Aerial
    },
    {
      eventId: 11,
      subEventId: null,
      eventName: "Duel",
      subEventName: "Ground duel",
      matchPeriod: "1H",
      eventSec: 3000,
      startX: 55,
      startY: 48,
      endX: null,
      endY: null,
      tags: [], // Unsuccessful
    },
    // Tackles
    {
      eventId: 10,
      subEventId: 40,
      eventName: "Tackle",
      subEventName: "Tackle",
      matchPeriod: "1H",
      eventSec: 2100,
      startX: 45,
      startY: 52,
      endX: null,
      endY: null,
      tags: [1801], // Successful
    },
    {
      eventId: 10,
      subEventId: 40,
      eventName: "Tackle",
      subEventName: "Tackle",
      matchPeriod: "1H",
      eventSec: 3900,
      startX: 50,
      startY: 50,
      endX: null,
      endY: null,
      tags: [1801], // Successful
    },
    // Fouls
    {
      eventId: 7,
      subEventId: 35,
      eventName: "Foul",
      subEventName: "Foul",
      matchPeriod: "1H",
      eventSec: 2700,
      startX: 55,
      startY: 50,
      endX: null,
      endY: null,
      tags: [],
    },
    // Interceptions
    {
      eventId: 12,
      subEventId: null,
      eventName: "Interception",
      subEventName: "Interception",
      matchPeriod: "1H",
      eventSec: 1800,
      startX: 50,
      startY: 50,
      endX: null,
      endY: null,
      tags: [1801], // Successful
    },
    {
      eventId: 12,
      subEventId: null,
      eventName: "Interception",
      subEventName: "Interception",
      matchPeriod: "1H",
      eventSec: 3600,
      startX: 45,
      startY: 48,
      endX: null,
      endY: null,
      tags: [1801], // Successful
    },
    // Ball Recovery
    {
      eventId: 13,
      subEventId: null,
      eventName: "Ball Recovery",
      subEventName: "Ball Recovery",
      matchPeriod: "1H",
      eventSec: 2400,
      startX: 50,
      startY: 50,
      endX: null,
      endY: null,
      tags: [],
    },
    {
      eventId: 13,
      subEventId: null,
      eventName: "Ball Recovery",
      subEventName: "Ball Recovery",
      matchPeriod: "1H",
      eventSec: 4200,
      startX: 55,
      startY: 52,
      endX: null,
      endY: null,
      tags: [],
    },

    // Second Half Events
    // Passes (successful)
    {
      eventId: 8,
      subEventId: 85,
      eventName: "Pass",
      subEventName: "Simple pass",
      matchPeriod: "2H",
      eventSec: 600,
      startX: 50,
      startY: 50,
      endX: 58,
      endY: 50,
      tags: [1801], // Successful
    },
    {
      eventId: 8,
      subEventId: 85,
      eventName: "Pass",
      subEventName: "Forward pass",
      matchPeriod: "2H",
      eventSec: 1200,
      startX: 55,
      startY: 45,
      endX: 72,
      endY: 48,
      tags: [1801], // Successful
    },
    {
      eventId: 8,
      subEventId: 85,
      eventName: "Pass",
      subEventName: "Cross",
      matchPeriod: "2H",
      eventSec: 1800,
      startX: 88,
      startY: 25,
      endX: 95,
      endY: 50,
      tags: [1801, 2], // Successful, Cross
    },
    {
      eventId: 8,
      subEventId: 85,
      eventName: "Pass",
      subEventName: "Simple pass",
      matchPeriod: "2H",
      eventSec: 2400,
      startX: 60,
      startY: 55,
      endX: 65,
      endY: 53,
      tags: [1801], // Successful
    },
    {
      eventId: 8,
      subEventId: 85,
      eventName: "Pass",
      subEventName: "Backward pass",
      matchPeriod: "2H",
      eventSec: 3000,
      startX: 65,
      startY: 50,
      endX: 58,
      endY: 52,
      tags: [1801], // Successful
    },
    {
      eventId: 8,
      subEventId: 85,
      eventName: "Pass",
      subEventName: "Simple pass",
      matchPeriod: "2H",
      eventSec: 3600,
      startX: 45,
      startY: 50,
      endX: 52,
      endY: 50,
      tags: [1801], // Successful
    },
    {
      eventId: 8,
      subEventId: 85,
      eventName: "Pass",
      subEventName: "Forward pass",
      matchPeriod: "2H",
      eventSec: 4200,
      startX: 50,
      startY: 50,
      endX: 68,
      endY: 45,
      tags: [1801], // Successful
    },
    {
      eventId: 8,
      subEventId: 85,
      eventName: "Pass",
      subEventName: "Simple pass",
      matchPeriod: "2H",
      eventSec: 4800,
      startX: 55,
      startY: 50,
      endX: 60,
      endY: 50,
      tags: [1801], // Successful
    },
    // Passes (unsuccessful)
    {
      eventId: 8,
      subEventId: 85,
      eventName: "Pass",
      subEventName: "Simple pass",
      matchPeriod: "2H",
      eventSec: 5400,
      startX: 60,
      startY: 48,
      endX: 70,
      endY: 52,
      tags: [], // Unsuccessful
    },
    // Shots
    {
      eventId: 2,
      subEventId: 15,
      eventName: "Shot",
      subEventName: "Shot on target",
      matchPeriod: "2H",
      eventSec: 2100,
      startX: 82,
      startY: 50,
      endX: 100,
      endY: 50,
      tags: [101], // On target
    },
    {
      eventId: 2,
      subEventId: 16,
      eventName: "Shot",
      subEventName: "Shot off target",
      matchPeriod: "2H",
      eventSec: 3300,
      startX: 78,
      startY: 48,
      endX: 100,
      endY: 35,
      tags: [], // Off target
    },
    {
      eventId: 2,
      subEventId: 15,
      eventName: "Shot",
      subEventName: "Shot on target",
      matchPeriod: "2H",
      eventSec: 4500,
      startX: 85,
      startY: 52,
      endX: 100,
      endY: 48,
      tags: [101], // On target
    },
    // Goal
    {
      eventId: 1,
      subEventId: 10,
      eventName: "Goal",
      subEventName: "Normal Goal",
      matchPeriod: "2H",
      eventSec: 2250,
      startX: 88,
      startY: 50,
      endX: 100,
      endY: 50,
      tags: [101], // On target
    },
    // Assist (for the goal)
    {
      eventId: 14,
      subEventId: null,
      eventName: "Assist",
      subEventName: "Assist",
      matchPeriod: "2H",
      eventSec: 2200,
      startX: 75,
      startY: 48,
      endX: 88,
      endY: 50,
      tags: [1801], // Successful
    },
    // Dribbles
    {
      eventId: 9,
      subEventId: 70,
      eventName: "Dribble",
      subEventName: "Dribble",
      matchPeriod: "2H",
      eventSec: 900,
      startX: 60,
      startY: 50,
      endX: 70,
      endY: 52,
      tags: [1801], // Successful
    },
    {
      eventId: 9,
      subEventId: 70,
      eventName: "Dribble",
      subEventName: "Dribble",
      matchPeriod: "2H",
      eventSec: 2700,
      startX: 65,
      startY: 48,
      endX: 75,
      endY: 50,
      tags: [1801], // Successful
    },
    {
      eventId: 9,
      subEventId: 70,
      eventName: "Dribble",
      subEventName: "Dribble",
      matchPeriod: "2H",
      eventSec: 3900,
      startX: 55,
      startY: 52,
      endX: 60,
      endY: 55,
      tags: [], // Unsuccessful
    },
    // Duels
    {
      eventId: 11,
      subEventId: null,
      eventName: "Duel",
      subEventName: "Ground duel",
      matchPeriod: "2H",
      eventSec: 1500,
      startX: 50,
      startY: 50,
      endX: null,
      endY: null,
      tags: [1801], // Successful
    },
    {
      eventId: 11,
      subEventId: null,
      eventName: "Duel",
      subEventName: "Aerial duel",
      matchPeriod: "2H",
      eventSec: 3000,
      startX: 60,
      startY: 50,
      endX: null,
      endY: null,
      tags: [1801, 15], // Successful, Aerial
    },
    {
      eventId: 11,
      subEventId: null,
      eventName: "Duel",
      subEventName: "Ground duel",
      matchPeriod: "2H",
      eventSec: 4500,
      startX: 55,
      startY: 48,
      endX: null,
      endY: null,
      tags: [], // Unsuccessful
    },
    {
      eventId: 11,
      subEventId: null,
      eventName: "Duel",
      subEventName: "Ground duel",
      matchPeriod: "2H",
      eventSec: 5100,
      startX: 50,
      startY: 52,
      endX: null,
      endY: null,
      tags: [1801], // Successful
    },
    // Tackles
    {
      eventId: 10,
      subEventId: 40,
      eventName: "Tackle",
      subEventName: "Tackle",
      matchPeriod: "2H",
      eventSec: 1800,
      startX: 45,
      startY: 50,
      endX: null,
      endY: null,
      tags: [1801], // Successful
    },
    {
      eventId: 10,
      subEventId: 40,
      eventName: "Tackle",
      subEventName: "Tackle",
      matchPeriod: "2H",
      eventSec: 3600,
      startX: 50,
      startY: 48,
      endX: null,
      endY: null,
      tags: [1801], // Successful
    },
    // Fouls
    {
      eventId: 7,
      subEventId: 35,
      eventName: "Foul",
      subEventName: "Foul",
      matchPeriod: "2H",
      eventSec: 2400,
      startX: 55,
      startY: 50,
      endX: null,
      endY: null,
      tags: [],
    },
    {
      eventId: 7,
      subEventId: 36,
      eventName: "Foul",
      subEventName: "Foul suffered",
      matchPeriod: "2H",
      eventSec: 4200,
      startX: 60,
      startY: 50,
      endX: null,
      endY: null,
      tags: [1701], // Foul suffered
    },
    // Interceptions
    {
      eventId: 12,
      subEventId: null,
      eventName: "Interception",
      subEventName: "Interception",
      matchPeriod: "2H",
      eventSec: 1200,
      startX: 50,
      startY: 50,
      endX: null,
      endY: null,
      tags: [1801], // Successful
    },
    {
      eventId: 12,
      subEventId: null,
      eventName: "Interception",
      subEventName: "Interception",
      matchPeriod: "2H",
      eventSec: 4800,
      startX: 45,
      startY: 48,
      endX: null,
      endY: null,
      tags: [1801], // Successful
    },
    // Ball Recovery
    {
      eventId: 13,
      subEventId: null,
      eventName: "Ball Recovery",
      subEventName: "Ball Recovery",
      matchPeriod: "2H",
      eventSec: 2100,
      startX: 50,
      startY: 50,
      endX: null,
      endY: null,
      tags: [],
    },
    {
      eventId: 13,
      subEventId: null,
      eventName: "Ball Recovery",
      subEventName: "Ball Recovery",
      matchPeriod: "2H",
      eventSec: 5400,
      startX: 55,
      startY: 52,
      endX: null,
      endY: null,
      tags: [],
    },
  ];

  // Create events
  console.log(`📊 Creating ${events.length} events for player ${player.firstName} ${player.lastName}...`);

  for (const eventData of events) {
    await prisma.matchEvent.create({
      data: {
        matchId: match.id,
        playerId: player.id,
        teamId: matchPlayer.teamId,
        eventId: eventData.eventId,
        subEventId: eventData.subEventId,
        eventName: eventData.eventName,
        subEventName: eventData.subEventName,
        matchPeriod: eventData.matchPeriod,
        eventSec: new Prisma.Decimal(eventData.eventSec),
        startX: new Prisma.Decimal(eventData.startX),
        startY: new Prisma.Decimal(eventData.startY),
        endX: eventData.endX ? new Prisma.Decimal(eventData.endX) : null,
        endY: eventData.endY ? new Prisma.Decimal(eventData.endY) : null,
        tags: {
          create: eventData.tags.map((tagId) => ({
            tagId,
          })),
        },
      },
    });
  }

  // Update player stats in MatchPlayer
  const totalGoals = events.filter((e) => e.eventName === "Goal").length;
  const totalAssists = events.filter((e) => e.eventName === "Assist").length;
  const totalPasses = events.filter((e) => e.eventName === "Pass").length;
  const successfulPasses = events.filter(
    (e) => e.eventName === "Pass" && e.tags.includes(1801)
  ).length;

  await prisma.matchPlayer.update({
    where: {
      id: matchPlayer.id,
    },
    data: {
      goals: totalGoals,
      assists: totalAssists,
      minutesPlayed: 90,
    },
  });

  console.log(`✅ Successfully added ${events.length} events`);
  console.log(`📈 Statistics:`);
  console.log(`   - Goals: ${totalGoals}`);
  console.log(`   - Assists: ${totalAssists}`);
  console.log(`   - Passes: ${totalPasses} (${successfulPasses} successful)`);
  console.log(`   - Shots: ${events.filter((e) => e.eventName === "Shot").length}`);
  console.log(`   - Dribbles: ${events.filter((e) => e.eventName === "Dribble").length}`);
  console.log(`   - Duels: ${events.filter((e) => e.eventName === "Duel").length}`);
  console.log(`   - Tackles: ${events.filter((e) => e.eventName === "Tackle").length}`);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
