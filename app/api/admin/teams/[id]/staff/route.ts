import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import { auth } from "@/lib/auth";
import { verifyUserCanManageTeam } from "@/lib/auth/roles";

const createStaffSchema = z.object({
  fullName: z.string().min(1).max(200),
  roleTitle: z.string().min(1).max(200),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().max(200).optional().nullable(),
  sortOrder: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

/**
 * POST /api/admin/teams/[id]/staff
 * Create team staff member (team manager: ADMIN or COACH of this team)
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

    const { id: teamId } = await params;

    const hasAccess = await verifyUserCanManageTeam(teamId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Доступ запрещен" }, { status: 403 });
    }

    const body = await request.json();
    const validation = createStaffSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Некорректные данные" },
        { status: 400 }
      );
    }

    const created = await prisma.teamStaffMember.create({
      data: {
        teamId,
        fullName: validation.data.fullName,
        roleTitle: validation.data.roleTitle,
        phone: validation.data.phone || null,
        email: validation.data.email || null,
        sortOrder: validation.data.sortOrder,
        isActive: validation.data.isActive,
      },
    });

    logger.info(
      {
        action: "team.staff.created",
        teamId,
        staffId: created.id,
        actorId: session.user.id,
      },
      "Team staff member created"
    );

    return NextResponse.json(
      {
        id: created.id,
        teamId: created.teamId,
        fullName: created.fullName,
        roleTitle: created.roleTitle,
        photoUrl: created.photoUrl,
        phone: created.phone,
        email: created.email,
        sortOrder: created.sortOrder,
        isActive: created.isActive,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error({ error }, "Ошибка создания сотрудника штаба");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

