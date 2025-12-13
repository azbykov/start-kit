import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";

/**
 * Server-side: Verify user has specific role
 * Checks role from database (source of truth)
 */
export async function verifyUserRole(requiredRole: Role): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    return false;
  }

  if (user.role !== requiredRole) {
    // Role mismatch - log for security monitoring (NFR-006)
    console.warn(
      `Role mismatch for user ${session.user.id}: expected ${requiredRole}, got ${user.role}`
    );
    return false;
  }

  return true;
}

/**
 * Server-side: Check if user has any of the allowed roles
 * Checks role from database (source of truth)
 */
export async function verifyUserHasAnyRole(
  allowedRoles: Role[]
): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    return false;
  }

  return allowedRoles.includes(user.role);
}

/**
 * Server-side: Check if user can manage a specific team
 * ADMIN - can manage any team
 * COACH - can manage only their own team (User.teamId === teamId)
 * Checks role and teamId from database (source of truth)
 */
export async function verifyUserCanManageTeam(
  teamId: string
): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.id) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isActive: true, teamId: true },
  });

  if (!user || !user.isActive) {
    return false;
  }

  // ADMIN can manage any team
  if (user.role === Role.ADMIN) {
    return true;
  }

  // COACH can manage only their own team
  if (user.role === Role.COACH && user.teamId === teamId) {
    return true;
  }

  return false;
}

