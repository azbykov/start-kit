"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  UserRound,
  Trophy,
  Users2,
  Calendar,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    title: "Дашборд",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Игроки",
    href: "/players",
    icon: UserRound,
  },
  {
    title: "Турниры",
    href: "/tournaments",
    icon: Trophy,
  },
  {
    title: "Команды",
    href: "/teams",
    icon: Users2,
  },
  {
    title: "Матчи",
    href: "/matches",
    icon: Calendar,
  },
  {
    title: "Пользователи",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Аналитика",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    title: "Настройки",
    href: "/settings",
    icon: Settings,
  },
];

interface AppSidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  onToggle?: () => void;
}

export function AppSidebar({ isOpen, onClose, onToggle: _onToggle }: AppSidebarProps) {
  const pathname = usePathname();

  const handleLinkClick = (_e: React.MouseEvent<HTMLAnchorElement>) => {
    // Close sidebar only on mobile devices
    if (window.innerWidth < 768 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-12 z-40 h-[calc(100vh-3rem)] border-r border-border bg-card transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0 w-60" : "-translate-x-full w-0",
          "overflow-hidden"
        )}
      >
        <nav className="flex h-full flex-col p-3">
          <div className="space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}
