import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { TeamsPageClient } from "@/components/teams/teams-page-client";

export default async function TeamsPage() {
  // Check session for admin actions (public page, no redirect if not authenticated)
  const session = await auth();
  const isAdmin = session?.user?.role === Role.ADMIN;

  return <TeamsPageClient isAdmin={isAdmin} />;
}

