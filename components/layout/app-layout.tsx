"use client";

import { PublicHeader } from "./public-header";
import { PublicFooter } from "./public-footer";
import { PageTitleProvider } from "./page-title-context";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <PageTitleProvider>
      <div className="flex min-h-screen flex-col">
        <PublicHeader />
        <main className="flex-1">{children}</main>
        <PublicFooter />
      </div>
    </PageTitleProvider>
  );
}
