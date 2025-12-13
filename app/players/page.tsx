import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { PlayersPageClient } from "@/components/players/players-page-client";

export default async function PlayersPage() {
  // Check session for admin actions (public page, no redirect if not authenticated)
  const session = await auth();
  const isAdmin = session?.user?.role === Role.ADMIN;

  return (
    <PlayersPageClient isAdmin={isAdmin} />
  );
}



