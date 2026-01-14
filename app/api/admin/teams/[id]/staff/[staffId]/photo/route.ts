import { NextRequest, NextResponse } from "next/server";
import { put, del } from "@vercel/blob";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import { auth } from "@/lib/auth";
import { verifyUserCanManageTeam } from "@/lib/auth/roles";

export const runtime = "nodejs";

/**
 * POST /api/admin/teams/[id]/staff/[staffId]/photo
 * Upload staff photo (team manager)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; staffId: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { id: teamId, staffId } = await params;

    const hasAccess = await verifyUserCanManageTeam(teamId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const existing = await prisma.teamStaffMember.findFirst({
      where: { id: staffId, teamId },
      select: { id: true, photoUrl: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Сотрудник не найден" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Файл не загружен" },
        { status: 400 }
      );
    }

    if (existing.photoUrl) {
      try {
        await del(existing.photoUrl);
      } catch (blobError) {
        logger.warn(
          { blobError, teamId, staffId },
          "Failed to delete previous staff photo"
        );
      }
    }

    const blob = await put(`team-staff/${teamId}/${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    const updated = await prisma.teamStaffMember.update({
      where: { id: existing.id },
      data: {
        photoUrl: blob.url,
        photoPathname: blob.pathname,
      },
      select: {
        id: true,
        teamId: true,
        fullName: true,
        roleTitle: true,
        photoUrl: true,
        phone: true,
        email: true,
        sortOrder: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      id: updated.id,
      teamId: updated.teamId,
      fullName: updated.fullName,
      roleTitle: updated.roleTitle,
      photoUrl: updated.photoUrl,
      phone: updated.phone,
      email: updated.email,
      sortOrder: updated.sortOrder,
      isActive: updated.isActive,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (error) {
    const err =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : { message: String(error) };
    logger.error({ err }, "Ошибка загрузки фото сотрудника штаба");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/teams/[id]/staff/[staffId]/photo
 * Remove staff photo (team manager)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; staffId: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { id: teamId, staffId } = await params;

    const hasAccess = await verifyUserCanManageTeam(teamId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const existing = await prisma.teamStaffMember.findFirst({
      where: { id: staffId, teamId },
      select: { id: true, photoUrl: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Сотрудник не найден" },
        { status: 404 }
      );
    }

    if (existing.photoUrl) {
      try {
        await del(existing.photoUrl);
      } catch (blobError) {
        logger.warn(
          { blobError, teamId, staffId },
          "Failed to delete staff photo"
        );
      }
    }

    const updated = await prisma.teamStaffMember.update({
      where: { id: existing.id },
      data: { photoUrl: null, photoPathname: null },
      select: { id: true },
    });

    return NextResponse.json({
      success: true,
      message: "Фото удалено",
      staffId: updated.id,
    });
  } catch (error) {
    const err =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : { message: String(error) };
    logger.error({ err }, "Ошибка удаления фото сотрудника штаба");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

