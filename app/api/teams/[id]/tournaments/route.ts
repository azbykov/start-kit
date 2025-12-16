import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

/**
 * GET /api/teams/[id]/tournaments
 * Get list of tournaments where team participates (public - no authentication required)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;

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

    // Get tournaments where team participates
    const tournamentTeams = await prisma.tournamentTeam.findMany({
      where: { teamId },
      include: {
        tournament: {
          select: {
            id: true,
            name: true,
            logo: true,
            season: true,
            location: true,
            status: true,
            startDate: true,
            endDate: true,
            isActive: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format response
    const tournaments = tournamentTeams.map((tt) => ({
      id: tt.tournament.id,
      name: tt.tournament.name,
      logo: tt.tournament.logo,
      season: tt.tournament.season,
      location: tt.tournament.location,
      status: tt.tournament.status,
      startDate: tt.tournament.startDate?.toISOString().split("T")[0] || null,
      endDate: tt.tournament.endDate?.toISOString().split("T")[0] || null,
      isActive: tt.tournament.isActive,
    }));

    return NextResponse.json({
      tournaments,
    });
  } catch (error) {
    logger.error({ error }, "Ошибка получения турниров команды");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

