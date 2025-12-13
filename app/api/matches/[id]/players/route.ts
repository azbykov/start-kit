import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

/**
 * GET /api/matches/[id]/players
 * Get players for a match with statistics (public - no authentication required)
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
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
          },
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
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

    // Fetch match players with player and team info
    const matchPlayers = await prisma.matchPlayer.findMany({
      where: { matchId: id },
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
            position: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { isStarter: "desc" },
        { teamId: "asc" },
      ],
    });

    // Group players by team
    const homeTeamPlayers = matchPlayers
      .filter((mp) => mp.teamId === match.homeTeamId)
      .map((mp) => ({
        id: mp.id,
        matchId: mp.matchId,
        playerId: mp.playerId,
        playerName: `${mp.player.firstName} ${mp.player.lastName}`,
        playerImage: mp.player.image,
        playerPosition: mp.player.position,
        teamId: mp.teamId,
        teamName: mp.team.name,
        goals: mp.goals,
        assists: mp.assists,
        yellowCards: mp.yellowCards,
        redCards: mp.redCards,
        minutesPlayed: mp.minutesPlayed,
        isStarter: mp.isStarter,
      }));

    const awayTeamPlayers = matchPlayers
      .filter((mp) => mp.teamId === match.awayTeamId)
      .map((mp) => ({
        id: mp.id,
        matchId: mp.matchId,
        playerId: mp.playerId,
        playerName: `${mp.player.firstName} ${mp.player.lastName}`,
        playerImage: mp.player.image,
        playerPosition: mp.player.position,
        teamId: mp.teamId,
        teamName: mp.team.name,
        goals: mp.goals,
        assists: mp.assists,
        yellowCards: mp.yellowCards,
        redCards: mp.redCards,
        minutesPlayed: mp.minutesPlayed,
        isStarter: mp.isStarter,
      }));

    return NextResponse.json({
      homeTeam: {
        teamId: match.homeTeamId,
        teamName: match.homeTeam.name,
        players: homeTeamPlayers,
      },
      awayTeam: {
        teamId: match.awayTeamId,
        teamName: match.awayTeam.name,
        players: awayTeamPlayers,
      },
    });
  } catch (error) {
    logger.error({ error }, "Ошибка получения игроков матча");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}


