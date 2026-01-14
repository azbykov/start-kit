import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";

/**
 * GET /api/tournaments/[id]/documents
 * Get tournament documents (public - no authentication required)
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tournamentId } = await params;

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { id: true },
    });

    if (!tournament) {
      return NextResponse.json(
        { error: "Турнир не найден" },
        { status: 404 }
      );
    }

    const documents = await (prisma as any).tournamentDocument.findMany({
      where: { tournamentId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        blobUrl: true,
        contentType: true,
        size: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      documents: documents.map((d) => ({
        id: d.id,
        title: d.title,
        url: d.blobUrl,
        contentType: d.contentType,
        size: d.size,
        createdAt: d.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    logger.error({ error }, "Ошибка получения документов турнира");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

