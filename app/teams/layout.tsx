import { AppLayout } from "@/components/layout/app-layout";

/**
 * Layout for public teams pages
 * Uses AppLayout but doesn't require authentication
 */
export default function TeamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}

