import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import { auth } from "@/lib/auth";
import { verifyUserRole } from "@/lib/auth/roles";
import { Role } from "@prisma/client";

export const runtime = "nodejs";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_DOCUMENTS_PER_TOURNAMENT = 5;

const ALLOWED_MIME_TYPES = new Set<string>([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ALLOWED_EXTENSIONS = new Set<string>(["pdf", "doc", "docx"]);

function getFileExtension(filename: string): string | null {
  const parts = filename.split(".");
  if (parts.length < 2) return null;
  return parts[parts.length - 1]?.toLowerCase() || null;
}

/**
 * POST /api/admin/tournaments/[id]/documents
 * Upload tournament document (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const formData = await request.formData();
    const titleRaw = formData.get("title");
    const file = formData.get("file");

    const title =
      typeof titleRaw === "string" && titleRaw.trim().length > 0
        ? titleRaw.trim()
        : null;

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Файл не загружен" },
        { status: 400 }
      );
    }

    // Limit: max 5 documents per tournament
    const existingCount = await (prisma as any).tournamentDocument.count({
      where: { tournamentId },
    });
    if (existingCount >= MAX_DOCUMENTS_PER_TOURNAMENT) {
      return NextResponse.json(
        { error: "Можно загрузить максимум 5 документов на турнир" },
        { status: 400 }
      );
    }

    // Limit: max 10 MB
    if (typeof file.size === "number" && file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Максимальный размер файла — 10 МБ" },
        { status: 400 }
      );
    }

    // Limit: only PDF/DOC/DOCX
    const ext = getFileExtension(file.name);
    const mime = (file.type || "").toLowerCase();
    const isAllowedByExt = !!ext && ALLOWED_EXTENSIONS.has(ext);
    const isAllowedByMime = !!mime && ALLOWED_MIME_TYPES.has(mime);
    if (!isAllowedByExt && !isAllowedByMime) {
      return NextResponse.json(
        { error: "Разрешены только файлы PDF, DOC или DOCX" },
        { status: 400 }
      );
    }

    const safeTitle = title || file.name;

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      logger.error(
        { hasToken: false },
        "BLOB_READ_WRITE_TOKEN is not configured"
      );
      return NextResponse.json(
        { error: "Не настроено хранилище файлов (BLOB_READ_WRITE_TOKEN)" },
        { status: 500 }
      );
    }

    const blob = await put(file.name, file, {
      access: "public",
      addRandomSuffix: true,
    });

    const created = await (prisma as any).tournamentDocument.create({
      data: {
        tournamentId,
        title: safeTitle,
        blobUrl: blob.url,
        blobPathname: blob.pathname,
        contentType: file.type || null,
        size: typeof file.size === "number" ? file.size : null,
      },
      select: {
        id: true,
        title: true,
        blobUrl: true,
        contentType: true,
        size: true,
        createdAt: true,
      },
    });

    logger.info(
      {
        action: "tournament.document.uploaded",
        tournamentId,
        documentId: created.id,
        adminId: session.user.id,
      },
      "Tournament document uploaded"
    );

    return NextResponse.json(
      {
        id: created.id,
        title: created.title,
        url: created.blobUrl,
        contentType: created.contentType,
        size: created.size,
        createdAt: created.createdAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    const err =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : { message: String(error) };
    logger.error({ err }, "Ошибка загрузки документа турнира");

    const message =
      err.message?.toLowerCase().includes("blob") ||
      err.message?.toLowerCase().includes("token")
        ? "Ошибка загрузки в хранилище файлов. Проверьте BLOB_READ_WRITE_TOKEN."
        : "Внутренняя ошибка сервера";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

