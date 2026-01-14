import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import { auth } from "@/lib/auth";
import { verifyUserRole } from "@/lib/auth/roles";
import { Role } from "@prisma/client";

export const runtime = "nodejs";

/**
 * DELETE /api/admin/tournaments/[id]/documents/[docId]
 * Delete tournament document (admin only)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const hasAccess = await verifyUserRole(Role.ADMIN);
    if (!hasAccess) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const { id: tournamentId, docId } = await params;

    const existing = await (prisma as any).tournamentDocument.findFirst({
      where: { id: docId, tournamentId },
      select: { id: true, blobUrl: true, title: true },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Документ не найден" },
        { status: 404 }
      );
    }

    // Best-effort blob deletion: if blob is already gone, we still remove DB record.
    try {
      await del(existing.blobUrl);
    } catch (blobError) {
      logger.warn(
        { blobError, documentId: existing.id, tournamentId },
        "Failed to delete blob; proceeding with DB deletion"
      );
    }

    await (prisma as any).tournamentDocument.delete({
      where: { id: existing.id },
    });

    logger.info(
      {
        action: "tournament.document.deleted",
        tournamentId,
        documentId: existing.id,
        adminId: session.user.id,
      },
      "Tournament document deleted"
    );

    return NextResponse.json({
      success: true,
      message: "Документ удалён",
    });
  } catch (error) {
    const err =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : { message: String(error) };
    logger.error({ err }, "Ошибка удаления документа турнира");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

