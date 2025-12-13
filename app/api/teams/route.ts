import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import { paginationSchema } from "@/lib/validations/team";

/**
 * GET /api/teams
 * List teams with pagination (public - no authentication required)
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

    // Fetch teams with pagination and player count
    const [teams, total] = await Promise.all([
      prisma.team.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { players: true },
          },
        },
      }),
      prisma.team.count(),
    ]);

    // Format response
    const formattedTeams = teams.map((team) => ({
      id: team.id,
      name: team.name,
      logo: team.logo,
      coach: team.coach,
      city: team.city,
      country: team.country,
      isActive: team.isActive,
      createdAt: team.createdAt.toISOString(),
      updatedAt: team.updatedAt.toISOString(),
      playersCount: team._count.players,
    }));

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      teams: formattedTeams,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    logger.error({ error }, "Ошибка получения списка команд");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

