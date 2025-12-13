import { AppLayout } from "@/components/layout/app-layout";

/**
 * Layout for public players pages
 * Uses AppLayout but doesn't require authentication
 */
export default function PlayersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}

