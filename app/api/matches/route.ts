import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import { paginationSchema } from "@/lib/validations/match";

/**
 * GET /api/matches
 * List matches with pagination and filters (public - no authentication required)
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

    // Parse filters
    const tournamentId = searchParams.get("tournamentId");
    const teamId = searchParams.get("teamId");
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    // Build where clause
    const whereConditions: any[] = [];

    if (tournamentId) {
      whereConditions.push({ tournamentId });
    }

    if (teamId) {
      whereConditions.push({
        OR: [
          { homeTeamId: teamId },
          { awayTeamId: teamId },
        ],
      });
    }

    if (status) {
      whereConditions.push({ status });
    }

    if (dateFrom || dateTo) {
      const dateCondition: any = {};
      if (dateFrom) {
        dateCondition.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999);
        dateCondition.lte = toDate;
      }
      whereConditions.push({ date: dateCondition });
    }

    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    // Fetch matches with pagination
    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { date: "desc" },
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
            },
          },
        },
      }),
      prisma.match.count({ where }),
    ]);

    // Format response
    const formattedMatches = matches.map((match) => ({
      id: match.id,
      date: match.date.toISOString().split("T")[0],
      time: match.time,
      stadium: match.stadium,
      status: match.status,
      homeTeamId: match.homeTeamId,
      homeTeamName: match.homeTeam.name,
      homeTeamLogo: match.homeTeam.logo,
      awayTeamId: match.awayTeamId,
      awayTeamName: match.awayTeam.name,
      awayTeamLogo: match.awayTeam.logo,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
      tournamentId: match.tournamentId,
      tournamentName: match.tournament?.name || null,
      tournamentShortName: match.tournament?.shortName || null,
      createdAt: match.createdAt.toISOString(),
      updatedAt: match.updatedAt.toISOString(),
    }));

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      matches: formattedMatches,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    logger.error({ error }, "Ошибка получения списка матчей");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

