import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import { auth } from "@/lib/auth";
import { verifyUserCanManageTeam } from "@/lib/auth/roles";
import { del } from "@vercel/blob";

const updateStaffSchema = z.object({
  fullName: z.string().min(1).max(200).optional(),
  roleTitle: z.string().min(1).max(200).optional(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().max(200).optional().nullable(),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

/**
 * PATCH /api/admin/teams/[id]/staff/[staffId]
 * Update staff member (team manager)
 */
export async function PATCH(
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
      select: { id: true },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Сотрудник не найден" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = updateStaffSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Некорректные данные" },
        { status: 400 }
      );
    }

    const data: any = {};
    if (validation.data.fullName !== undefined) data.fullName = validation.data.fullName;
    if (validation.data.roleTitle !== undefined) data.roleTitle = validation.data.roleTitle;
    if (validation.data.phone !== undefined) data.phone = validation.data.phone || null;
    if (validation.data.email !== undefined) data.email = validation.data.email || null;
    if (validation.data.sortOrder !== undefined) data.sortOrder = validation.data.sortOrder;
    if (validation.data.isActive !== undefined) data.isActive = validation.data.isActive;

    const updated = await prisma.teamStaffMember.update({
      where: { id: existing.id },
      data,
    });

    logger.info(
      {
        action: "team.staff.updated",
        teamId,
        staffId: updated.id,
        actorId: session.user.id,
      },
      "Team staff member updated"
    );

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
    logger.error({ error }, "Ошибка обновления сотрудника штаба");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/teams/[id]/staff/[staffId]
 * Delete staff member (team manager)
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
          { blobError, staffId: existing.id, teamId },
          "Failed to delete staff photo; proceeding with DB deletion"
        );
      }
    }

    await prisma.teamStaffMember.delete({ where: { id: existing.id } });

    logger.info(
      {
        action: "team.staff.deleted",
        teamId,
        staffId: existing.id,
        actorId: session.user.id,
      },
      "Team staff member deleted"
    );

    return NextResponse.json({ success: true, message: "Сотрудник удалён" });
  } catch (error) {
    logger.error({ error }, "Ошибка удаления сотрудника штаба");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

