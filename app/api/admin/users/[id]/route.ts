import { auth } from "@/lib/auth";
import { verifyUserRole } from "@/lib/auth/roles";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import { updateUserSchema } from "@/lib/validations/user";

/**
 * GET /api/admin/users/[id]
 * Get single user by ID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const hasAccess = await verifyUserRole(Role.ADMIN);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });
  } catch (error) {
    logger.error({ error }, "Ошибка получения пользователя");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users/[id]
 * Update user data (email is immutable)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const hasAccess = await verifyUserRole(Role.ADMIN);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Check if email is being updated (FR-008 - email is immutable)
    if (body.email !== undefined) {
      return NextResponse.json(
        { error: "Email нельзя изменить" },
        { status: 400 }
      );
    }

    // Validate request body
    const validationResult = updateUserSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Некорректные данные" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    // Get previous values for audit log
    const previousValues = {
      name: existingUser.name,
      role: existingUser.role,
      isActive: existingUser.isActive,
    };

    const { name, role, isActive } = validationResult.data;

    // Update user (last-write-wins strategy - FR-019)
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name || null }),
        ...(role !== undefined && { role }),
        ...(isActive !== undefined && { isActive }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log audit action (FR-018)
    logger.info(
      {
        action: "user.updated",
        userId: updatedUser.id,
        adminId: session.user.id,
        data: {
          before: previousValues,
          after: {
            name: updatedUser.name,
            role: updatedUser.role,
            isActive: updatedUser.isActive,
          },
        },
      },
      "User updated by admin"
    );

    return NextResponse.json({
      ...updatedUser,
      createdAt: updatedUser.createdAt.toISOString(),
      updatedAt: updatedUser.updatedAt.toISOString(),
    });
  } catch (error) {
    logger.error({ error }, "Ошибка обновления пользователя");

    // Handle Prisma validation errors
    if (error instanceof Error && error.message.includes("Invalid enum")) {
      return NextResponse.json(
        { error: "Некорректное значение роли" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Delete user (with self-deletion prevention)
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "Не авторизован" },
        { status: 401 }
      );
    }

    const hasAccess = await verifyUserRole(Role.ADMIN);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Доступ запрещен" },
        { status: 403 }
      );
    }

    // Prevent self-deletion (FR-016)
    if (session.user.id === id) {
      return NextResponse.json(
        { error: "Нельзя удалить самого себя" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    // Delete user (cascades to accounts and sessions via Prisma)
    await prisma.user.delete({
      where: { id },
    });

    // Log audit action (FR-018)
    logger.info(
      {
        action: "user.deleted",
        userId: existingUser.id,
        adminId: session.user.id,
        data: {
          email: existingUser.email,
          name: existingUser.name,
          role: existingUser.role,
        },
      },
      "User deleted by admin"
    );

    return NextResponse.json({
      success: true,
      message: "Пользователь успешно удален",
    });
  } catch (error) {
    logger.error({ error }, "Ошибка удаления пользователя");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

