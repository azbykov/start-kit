import { Role } from "@prisma/client";

/**
 * Client-side check if user has a specific role
 * Uses role from session store (no database query)
 */
export function hasRole(
  session: { user?: { role?: Role } } | null,
  requiredRole: Role
): boolean {
  return session?.user?.role === requiredRole;
}

/**
 * Client-side check if user has any of the allowed roles
 * Uses role from session store (no database query)
 */
export function hasAnyRole(
  session: { user?: { role?: Role; teamId?: string | null } } | null,
  allowedRoles: Role[]
): boolean {
  if (!session?.user?.role) {
    return false;
  }
  return allowedRoles.includes(session.user.role);
}

/**
 * Client-side check if user can manage a specific team
 * ADMIN - can manage any team
 * COACH - can manage only their own team (User.teamId === teamId)
 * Uses role and teamId from session store (no database query)
 */
export function canManageTeam(
  session: { user?: { role?: Role; teamId?: string | null } } | null,
  teamId: string
): boolean {
  if (!session?.user?.role) {
    return false;
  }

  // ADMIN can manage any team
  if (session.user.role === Role.ADMIN) {
    return true;
  }

  // COACH can manage only their own team
  if (session.user.role === Role.COACH && session.user.teamId === teamId) {
    return true;
  }

  return false;
}















