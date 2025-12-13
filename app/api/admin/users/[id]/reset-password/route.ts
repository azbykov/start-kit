import { auth } from "@/lib/auth";
import { verifyUserRole } from "@/lib/auth/roles";
import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import logger from "@/lib/logger";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * POST /api/admin/users/[id]/reset-password
 * Reset user password and generate new temporary password
 */
export async function POST(
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

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Пользователь не найден" },
        { status: 404 }
      );
    }

    // Generate new random password (16 characters: uppercase, lowercase, numbers)
    // More readable format: XXXX-XXXX-XXXX-XXXX
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    const segments = [];
    for (let i = 0; i < 4; i++) {
      let segment = "";
      for (let j = 0; j < 4; j++) {
        segment += chars.charAt(
          Math.floor(crypto.randomBytes(1)[0] / 256 * chars.length)
        );
      }
      segments.push(segment);
    }
    const newPassword = segments.join("-");
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    // Log audit action (FR-018)
    logger.info(
      {
        action: "user.password_reset",
        userId: existingUser.id,
        adminId: session.user.id,
        data: {
          email: existingUser.email,
        },
      },
      "User password reset by admin"
    );

    return NextResponse.json({
      success: true,
      message: "Пароль успешно сброшен",
      newPassword: newPassword, // Return new password so admin can copy it
    });
  } catch (error) {
    logger.error({ error }, "Ошибка сброса пароля");
    return NextResponse.json(
      { error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

