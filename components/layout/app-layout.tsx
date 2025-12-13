"use client";

import { useState, useEffect } from "react";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import { PageTitleProvider } from "./page-title-context";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_STORAGE_KEY = "sidebar-open";

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Load sidebar state from localStorage and handle initial mobile state
  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    const isMobile = window.innerWidth < 768;

    if (stored !== null) {
      setIsSidebarOpen(stored === "true" && !isMobile);
    } else {
      setIsSidebarOpen(!isMobile);
    }
  }, []);

  // Handle window resize - only close on mobile, preserve desktop state
  useEffect(() => {
    if (!isMounted) return;

    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setIsSidebarOpen(false);
      } else {
        // Restore desktop state from localStorage or default to true
        const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
        if (stored !== null) {
          setIsSidebarOpen(stored === "true");
        } else {
          setIsSidebarOpen(true);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMounted]);

  // Save sidebar state to localStorage
  useEffect(() => {
    if (!isMounted) return;
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isSidebarOpen));
    }
  }, [isSidebarOpen, isMounted]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <PageTitleProvider>
      <div className="flex min-h-screen flex-col">
        <AppHeader onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div className="flex flex-1">
          <AppSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        <main
          className={cn(
            "flex flex-1 flex-col transition-all duration-300 ease-in-out",
            isSidebarOpen ? "md:ml-60" : "md:ml-0"
          )}
        >
          <div className="flex h-full flex-col p-1 md:p-1">{children}</div>
        </main>
      </div>
    </div>
    </PageTitleProvider>
  );
}

