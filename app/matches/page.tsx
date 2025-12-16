import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { MatchesPageClient } from "@/components/matches/matches-page-client";

export default async function MatchesPage() {
  // Check session for admin actions (public page, no redirect if not authenticated)
  const session = await auth();
  const isAdmin = session?.user?.role === Role.ADMIN;

  return <MatchesPageClient isAdmin={isAdmin} />;
}













