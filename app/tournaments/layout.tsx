import { AppLayout } from "@/components/layout/app-layout";

/**
 * Layout for public tournaments pages
 * Uses AppLayout but doesn't require authentication
 */
export default function TournamentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}

