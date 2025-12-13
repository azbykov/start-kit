import { auth } from "@/lib/auth";
import { Role } from "@prisma/client";
import { TournamentsPageClient } from "@/components/tournaments/tournaments-page-client";

export default async function TournamentsPage() {
  // Check session for admin actions (public page, no redirect if not authenticated)
  const session = await auth();
  const isAdmin = session?.user?.role === Role.ADMIN;

  return <TournamentsPageClient isAdmin={isAdmin} />;
}

