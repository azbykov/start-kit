import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

/**
 * GET /api/tournaments/[id]
 * Get public tournament profile (no authentication required)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tournament = await prisma.tournament.findUnique({
      where: { id },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Турнир не найден" },
        { status: 404 }
      );
    }

    // Format response with public fields
    return NextResponse.json({
      id: tournament.id,
      name: tournament.name,
      shortName: tournament.shortName,
      organizer: tournament.organizer,
      description: tournament.description,
      season: tournament.season,
      location: tournament.location,
      sport: tournament.sport,
      format: tournament.format,
      gender: tournament.gender,
      ageGroup: tournament.ageGroup,
      birthYearFrom: tournament.birthYearFrom,
      birthYearTo: tournament.birthYearTo,
      status: tournament.status,
      logo: tournament.logo,
      startDate: tournament.startDate
        ? tournament.startDate.toISOString().split("T")[0]
        : null,
      endDate: tournament.endDate
        ? tournament.endDate.toISOString().split("T")[0]
        : null,
      isActive: tournament.isActive,
    });
  } catch (error) {
    logger.error({ error }, "Ошибка получения профиля турнира");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

