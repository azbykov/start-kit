"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "./user-menu";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  submenu?: string[];
}

const navItems: NavItem[] = [
  {
    label: "Игроки",
    href: "/players",
  },
  {
    label: "Турниры",
    href: "/tournaments",
  },
  {
    label: "Команды",
    href: "/teams",
  },
  {
    label: "Матчи",
    href: "/matches",
  },
];

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 md:gap-3">
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

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "text-foreground/80 hover:text-foreground hover:bg-secondary",
                      isActive && "text-foreground bg-secondary"
                    )}
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            {session && (
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className={cn(
                    "text-foreground/80 hover:text-foreground hover:bg-secondary",
                    pathname.startsWith("/dashboard") && "text-foreground bg-secondary"
                  )}
                >
                  Дашборд
                </Button>
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Search className="w-5 h-5" />
            </Button>
            {session ? (
              <UserMenu />
            ) : (
              <Link href="/sign-in">
                <Button variant="default" className="hidden sm:flex gap-2">
                  Войти
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-fade-up">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-4 py-3 text-foreground/80 hover:text-foreground hover:bg-secondary rounded-lg transition-colors",
                      isActive && "text-foreground bg-secondary"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {session && (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 text-foreground/80 hover:text-foreground hover:bg-secondary rounded-lg transition-colors",
                    pathname.startsWith("/dashboard") && "text-foreground bg-secondary"
                  )}
                >
                  Дашборд
                </Link>
              )}
              {!session && (
                <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="mt-4 w-full">Войти</Button>
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}



