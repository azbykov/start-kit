import { auth } from "@/lib/auth";
import { verifyUserRole } from "@/lib/auth/roles";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { UsersPageClient } from "@/components/admin/users/users-page-client";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session) {
    redirect("/sign-in?callbackUrl=/admin/users");
  }

  const hasAccess = await verifyUserRole(Role.ADMIN);
  if (!hasAccess) {
    redirect("/dashboard");
  }

  return <UsersPageClient />;
}

