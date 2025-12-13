"use client";

import type { MatchEvent } from "@/lib/types/matches";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FootballTimelineD3 } from "./football-timeline-d3";

interface MatchTimelineProps {
  events: MatchEvent[];
  homeTeamId: string;
  awayTeamId: string;
  isAdmin?: boolean;
  onAddEvent?: () => void;
}

export function MatchTimeline({
  events,
  homeTeamId,
  awayTeamId,
  isAdmin = false,
  onAddEvent,
}: MatchTimelineProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold">Таймлайн</CardTitle>
        {isAdmin && onAddEvent && (
          <Button variant="outline" size="sm" onClick={onAddEvent}>
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <FootballTimelineD3
          events={events}
          homeTeamId={homeTeamId}
          awayTeamId={awayTeamId}
          width={1200}
          height={300}
          className="w-full"
        />
      </CardContent>
    </Card>
  );
}


