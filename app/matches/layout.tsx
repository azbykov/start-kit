import { AppLayout } from "@/components/layout/app-layout";

/**
 * Layout for public matches pages
 * Uses AppLayout but doesn't require authentication
 */
export default function MatchesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}

