import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import { paginationSchema } from "@/lib/validations/player";

/**
 * GET /api/players
 * List players with pagination (public - no authentication required)
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

    // Fetch players with pagination and team info
    const [players, total] = await Promise.all([
      prisma.player.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.player.count(),
    ]);

    // Format dates to ISO strings
    const formattedPlayers = players.map((player) => ({
      id: player.id,
      firstName: player.firstName,
      lastName: player.lastName,
      position: player.position, // Array of positions
      dateOfBirth: player.dateOfBirth.toISOString().split("T")[0], // ISO date only
      teamId: player.teamId,
      teamName: player.team?.name || null, // Add team name
      image: player.image,
      marketValue: player.marketValue ? Number(player.marketValue) : null,
      contractExpires: player.contractExpires ? player.contractExpires.toISOString().split("T")[0] : null,
      totalMatches: player.totalMatches,
      totalGoals: player.totalGoals,
      totalAssists: player.totalAssists,
      totalMinutes: player.totalMinutes,
      videoLinks: player.videoLinks,
    }));

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({
      players: formattedPlayers,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
    });
  } catch (error) {
    logger.error({ error }, "Ошибка получения списка игроков");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}



