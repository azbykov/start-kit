"use client";

import { Position } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { positionShorts } from "@/lib/utils/player";
import { cn } from "@/lib/utils";

interface PositionBadgeProps {
  position: Position;
  className?: string;
}

/**
 * Badge component for displaying player position
 * Shows short abbreviation with color-coded background
 */
export function PositionBadge({ position, className }: PositionBadgeProps) {
  const short = positionShorts[position] || position;

  return (
    <Badge
      className={className}
    >
      {short}
    </Badge>
  );
}

interface PositionBadgesProps {
  positions: Position | Position[];
  className?: string;
}

/**
 * Component for displaying multiple position badges
 */
export function PositionBadges({ positions, className }: PositionBadgesProps) {
  const positionsArray = Array.isArray(positions) ? positions : [positions];

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {positionsArray.map((position, index) => (
        <PositionBadge key={index} position={position} />
      ))}
    </div>
  );
}

