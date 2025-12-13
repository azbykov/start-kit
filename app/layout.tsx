import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthSessionProvider } from "@/components/providers/session-provider";

export const metadata: Metadata = {
  title: "Youth Football Analytics Platform",
  description:
    "Web platform for youth football tournaments and player analytics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>
          <QueryProvider>{children}</QueryProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
