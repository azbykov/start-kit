import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

/**
 * GET /api/tournaments/[id]/teams
 * Get list of teams participating in tournament (public - no authentication required)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params;

    // Check if tournament exists
    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Турнир не найден" },
        { status: 404 }
      );
    }

    // Get teams in tournament
    const tournamentTeams = await prisma.tournamentTeam.findMany({
      where: { tournamentId },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            logo: true,
            city: true,
            country: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      teams: tournamentTeams.map((tt) => ({
        id: tt.team.id,
        name: tt.team.name,
        logo: tt.team.logo,
        city: tt.team.city,
        country: tt.team.country,
      })),
    });
  } catch (error) {
    logger.error({ error }, "Ошибка получения команд турнира");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

