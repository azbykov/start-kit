"use client";

import Link from "next/link";
import Image from "next/image";
import { Users } from "lucide-react";

interface TeamLinkProps {
  team: {
    id: string;
    name: string;
    logo: string | null;
  };
  size?: "sm" | "md" | "lg";
  showLogo?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: {
    logo: "h-4 w-4",
    text: "text-xs",
    gap: "gap-1.5",
  },
  md: {
    logo: "h-6 w-6",
    text: "text-sm",
    gap: "gap-2",
  },
  lg: {
    logo: "h-8 w-8",
    text: "text-base",
    gap: "gap-2.5",
  },
};

export function TeamLink({
  team,
  size = "md",
  showLogo = true,
  className = "",
}: TeamLinkProps) {
  const sizes = sizeClasses[size];

  return (
    <Link
      href={`/teams/${team.id}`}
      className={`flex items-center ${sizes.gap} hover:opacity-80 transition-opacity ${className}`}
    >
      {showLogo && (
        <>
          {team.logo ? (
            <div className={`relative ${sizes.logo} rounded overflow-hidden border flex-shrink-0`}>
              <Image
                src={team.logo}
                alt={team.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div
              className={`${sizes.logo} rounded border bg-muted flex items-center justify-center flex-shrink-0`}
            >
              <Users className={`${sizes.logo} text-muted-foreground`} />
            </div>
          )}
        </>
      )}
      <span className={`${sizes.text} font-medium`}>{team.name}</span>
    </Link>
  );
}
