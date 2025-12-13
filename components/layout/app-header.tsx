"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "./page-title-context";
import { Menu, X, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserMenu } from "./user-menu";
import { TeamLink } from "@/components/teams/team-link";

interface AppHeaderProps {
  onMenuClick: () => void;
  isSidebarOpen: boolean;
}

export function AppHeader({ onMenuClick, isSidebarOpen }: AppHeaderProps) {
  const router = useRouter();
  const { title, metaData, showBackButton } = usePageTitle();

  // Determine what to show in center section
  const showPlayerInfo = metaData?.firstName && metaData?.lastName;
  const playerName = showPlayerInfo 
    ? `${metaData.firstName} ${metaData.lastName}`
    : null;
  
  // Show back button if player info is shown OR if showBackButton is explicitly set
  const shouldShowBackButton = showPlayerInfo || showBackButton;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm">
      <div className="grid h-11 grid-cols-3 items-center px-3 md:px-4">
        {/* Left section: Menu and Logo */}
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="h-8 w-8"
            aria-label={isSidebarOpen ? "Закрыть меню" : "Открыть меню"}
          >
            {isSidebarOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="Start Statistics Logo"
              width={20}
              height={20}
              className="h-5 w-5"
            />
            <span className="font-display text-sm font-semibold">
              <span className="text-[#016ADB]">Start</span>{" "}
              <span className="text-[#02A962]">Statistics</span>
            </span>
          </Link>
        </div>

        {/* Center section: Page Title or Player Info */}
        <div className="flex items-center justify-center gap-2">
          {showPlayerInfo ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className={cn(
                  "flex items-center gap-1 md:gap-2 rounded-md px-2 py-1 text-muted-foreground",
                  "hover:text-foreground hover:bg-accent transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                )}
                aria-label="Назад"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" />
                <span className="hidden md:inline text-sm">Назад</span>
              </Button>
              {metaData.image ? (
                <Avatar className="h-7 w-7">
                  <AvatarImage src={metaData.image} alt={playerName || ""} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold truncate max-w-full">
                  {playerName}
                </h1>
                {metaData.team && (
                  <TeamLink team={metaData.team} size="sm" className="text-xs" />
                )}
              </div>
            </>
          ) : title ? (
            <>
              {shouldShowBackButton && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className={cn(
                    "flex items-center gap-1 md:gap-2 rounded-md px-2 py-1 text-muted-foreground",
                    "hover:text-foreground hover:bg-accent transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                  aria-label="Назад"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  <span className="hidden md:inline text-sm">Назад</span>
                </Button>
              )}
              <h1 className="text-sm font-semibold truncate max-w-full">
                {title}
              </h1>
            </>
          ) : null}
        </div>

        {/* Right section: User Menu */}
        <div className="flex items-center justify-end gap-2">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

