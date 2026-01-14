import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import { paginationSchema } from "@/lib/validations/player";
import { Position } from "@prisma/client";

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

    const q = (searchParams.get("q") || "").trim();
    const teamId = (searchParams.get("teamId") || "").trim() || null;
    const tournamentId =
      (searchParams.get("tournamentId") || "").trim() || null;
    const positionsParam = (searchParams.get("positions") || "").trim();
    const dateOfBirthFromParam = (searchParams.get("dateOfBirthFrom") || "").trim();
    const dateOfBirthToParam = (searchParams.get("dateOfBirthTo") || "").trim();
    const ratingFromParam = (searchParams.get("ratingFrom") || "").trim();
    const ratingToParam = (searchParams.get("ratingTo") || "").trim();
    const sort = (searchParams.get("sort") || "newest").trim();

    const positions = positionsParam
      ? positionsParam
          .split(",")
          .map((p) => p.trim())
          .filter(Boolean)
      : [];

    const parsedPositions = positions.filter((p): p is Position =>
      Object.values(Position).includes(p as Position)
    ) as Position[];

    const dateOfBirthFrom = dateOfBirthFromParam
      ? new Date(dateOfBirthFromParam)
      : null;
    const dateOfBirthTo = dateOfBirthToParam
      ? new Date(dateOfBirthToParam)
      : null;

    const ratingFrom = ratingFromParam ? Number(ratingFromParam) : null;
    const ratingTo = ratingToParam ? Number(ratingToParam) : null;

    const hasInvalidDates =
      (dateOfBirthFrom && isNaN(dateOfBirthFrom.getTime())) ||
      (dateOfBirthTo && isNaN(dateOfBirthTo.getTime()));
    if (hasInvalidDates) {
      return NextResponse.json(
        { error: "Некорректные параметры даты рождения" },
        { status: 400 }
      );
    }

    const hasInvalidRating =
      (ratingFrom !== null && (!Number.isFinite(ratingFrom) || ratingFrom < 0 || ratingFrom > 100)) ||
      (ratingTo !== null && (!Number.isFinite(ratingTo) || ratingTo < 0 || ratingTo > 100));
    if (hasInvalidRating) {
      return NextResponse.json(
        { error: "Некорректные параметры рейтинга" },
        { status: 400 }
      );
    }

    const where: any = {};

    if (q) {
      const parts = q.split(/\s+/).filter(Boolean);
      if (parts.length === 1) {
        where.OR = [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
        ];
      } else {
        // Try to match "First Last" or "Last First"
        where.OR = [
          {
            AND: [
              { firstName: { contains: parts[0], mode: "insensitive" } },
              { lastName: { contains: parts.slice(1).join(" "), mode: "insensitive" } },
            ],
          },
          {
            AND: [
              { lastName: { contains: parts[0], mode: "insensitive" } },
              { firstName: { contains: parts.slice(1).join(" "), mode: "insensitive" } },
            ],
          },
        ];
      }
    }

    if (teamId) {
      where.teamId = teamId;
    }

    if (parsedPositions.length > 0) {
      where.position = { hasSome: parsedPositions };
    }

    if (dateOfBirthFrom || dateOfBirthTo) {
      where.dateOfBirth = {};
      if (dateOfBirthFrom) where.dateOfBirth.gte = dateOfBirthFrom;
      if (dateOfBirthTo) {
        // include whole day
        const end = new Date(dateOfBirthTo);
        end.setHours(23, 59, 59, 999);
        where.dateOfBirth.lte = end;
      }
    }

    if (ratingFrom !== null || ratingTo !== null) {
      where.rating = {};
      if (ratingFrom !== null) where.rating.gte = Math.floor(ratingFrom);
      if (ratingTo !== null) where.rating.lte = Math.floor(ratingTo);
    }

    if (tournamentId) {
      where.matchPlayers = {
        some: {
          match: {
            tournamentId,
          },
        },
      };
    }

    const orderBy =
      sort === "rating_desc"
        ? [{ rating: "desc" as const }, { lastName: "asc" as const }]
        : sort === "rating_asc"
        ? [{ rating: "asc" as const }, { lastName: "asc" as const }]
        : sort === "name"
        ? [{ lastName: "asc" as const }, { firstName: "asc" as const }]
        : [{ createdAt: "desc" as const }];

    // Fetch players with pagination and team info
    const [players, total] = await Promise.all([
      prisma.player.findMany({
        skip,
        take: pageSize,
        where,
        orderBy,
        include: {
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      prisma.player.count({ where }),
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
      rating: player.rating,
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



