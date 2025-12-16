import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Start Statistics - Youth Football Analytics Platform",
  description:
    "Web platform for youth football tournaments and player analytics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <AuthSessionProvider>
          <QueryProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </QueryProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
