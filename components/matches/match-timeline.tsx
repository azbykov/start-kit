"use client";

import type { MatchEvent } from "@/lib/types/matches";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, ArrowRightLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MatchTimelineProps {
  events: MatchEvent[];
  homeTeamId: string;
  awayTeamId: string;
  isAdmin?: boolean;
  onAddEvent?: () => void;
}

const EventIcon = ({ type }: { type: number }) => {
  // Event types: 1 = goal, 2 = card, 3 = substitution, etc.
  if (type === 1) {
    return <Target className="w-4 h-4 text-primary" />;
  }
  if (type === 2 || type === 3) {
    return <div className="w-3 h-4 bg-yellow-400 rounded-sm" />;
  }
  if (type === 4) {
    return <div className="w-3 h-4 bg-red-500 rounded-sm" />;
  }
  if (type === 5) {
    return <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />;
  }
  return null;
};

export function MatchTimeline({
  events,
  homeTeamId,
  awayTeamId,
  isAdmin = false,
  onAddEvent,
}: MatchTimelineProps) {
  // Sort events by time
  const sortedEvents = [...events].sort((a, b) => {
    const aSec = a.eventSec + (a.matchPeriod === "2H" ? 2700 : a.matchPeriod === "1H" ? 0 : 0);
    const bSec = b.eventSec + (b.matchPeriod === "2H" ? 2700 : b.matchPeriod === "1H" ? 0 : 0);
    return aSec - bSec;
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Хронология матча</CardTitle>
        {isAdmin && onAddEvent && (
          <Button variant="outline" size="sm" onClick={onAddEvent}>
            <Pencil className="h-4 w-4 mr-2" />
            Добавить событие
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {sortedEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            События отсутствуют
          </div>
        ) : (
          <div className="space-y-4">
            {sortedEvents.map((event, index) => {
              const isHomeTeam = event.team.id === homeTeamId;
              const minute = Math.floor(event.eventSec / 60);

              return (
                <div
                  key={event.id || index}
                  className={`flex items-center gap-4 p-3 rounded-lg bg-muted/50 ${
                    isHomeTeam ? "" : "flex-row-reverse"
                  }`}
                >
                  <div
                    className={`flex items-center gap-3 flex-1 ${
                      isHomeTeam ? "" : "flex-row-reverse text-right"
                    }`}
                  >
                    <EventIcon type={event.eventId} />
                    <div>
                      <div className="font-semibold">
                        {event.player?.name || event.eventName}
                      </div>
                      {event.subEventName && (
                        <div className="text-sm text-muted-foreground">
                          {event.subEventName}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {minute}'
                  </div>
                  <div className="flex-1" />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


