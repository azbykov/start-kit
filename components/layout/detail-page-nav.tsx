"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type DetailNavTab = {
  value: string;
  label: string;
};

export interface DetailPageNavProps {
  backHref: string;
  backLabel: string;
  tabs?: DetailNavTab[];
  tabsListClassName?: string;
  className?: string;
  rightSlot?: React.ReactNode;
}

export function DetailPageNav({
  backHref,
  backLabel,
  tabs,
  tabsListClassName,
  className,
  rightSlot,
}: DetailPageNavProps) {
  return (
    <div className={cn("bg-card border-b border-border", className)}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{backLabel}</span>
        </Link>

        {rightSlot ? (
          <div className="flex items-center justify-end">{rightSlot}</div>
        ) : tabs && tabs.length > 0 ? (
          <TabsList className={cn("bg-muted/50 border-0", tabsListClassName)}>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}


