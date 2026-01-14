import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import { paginationSchema } from "@/lib/validations/tournament";

/**
 * GET /api/tournaments
 * List tournaments with pagination (public - no authentication required)
 */
export async function GET(request: NextRequest) {
  try {
    // Parse and validate pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const pageParam = searchParams.get("page") || "1";
    const pageSizeParam = searchParams.get("pageSize") || "25";

    const paginationResult = paginationSchema.safeParse({
      page: pageParam,
      pageSize: pageSizeParam,
    });

    if (!paginationResult.success) {
      return NextResponse.json(
        { error: "Некорректные параметры пагинации" },
        { status: 400 }
      );
    }

    const { page, pageSize } = paginationResult.data;
    const skip = (page - 1) * pageSize;

    // Fetch tournaments with pagination
    const [tournaments, total] = await Promise.all([
      prisma.tournament.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.tournament.count(),
    ]);

    // Format dates to ISO strings
    const formattedTournaments = tournaments.map((tournament) => ({
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
      createdAt: tournament.createdAt.toISOString(),
      updatedAt: tournament.updatedAt.toISOString(),
    }));

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      tournaments: formattedTournaments,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    logger.error({ error }, "Ошибка получения списка турниров");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

