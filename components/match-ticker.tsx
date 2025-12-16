"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import { useMatchesList } from "@/lib/hooks/use-matches";

export function MatchTicker() {
  const { data, isLoading } = useMatchesList({ page: 1, pageSize: 10 });

  // Use matches from response
  const displayMatches = data?.matches?.slice(0, 6) || [];

  if (isLoading || displayMatches.length === 0) {
    return null;
  }

  return (
    <div className="bg-primary overflow-hidden">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-primary-foreground/80 shrink-0 px-2">
            <Trophy className="w-4 h-4" />
            <span className="text-sm font-medium hidden sm:inline">Активные матчи</span>
          </div>

          <div className="overflow-hidden flex-1">
            <div className="flex gap-6 animate-ticker hover:[animation-play-state:paused]">
              {[...displayMatches, ...displayMatches].map((match, idx) => {
                const homeScore = match.homeScore ?? null;
                const awayScore = match.awayScore ?? null;
                const isLive = match.status === "LIVE";
                const isFinished = match.status === "FINISHED";

                return (
                  <Link
                    key={`${match.id}-${idx}`}
                    href={`/matches/${match.id}`}
                    className="flex items-center gap-3 text-primary-foreground/90 hover:text-primary-foreground transition-colors shrink-0"
                  >
                    {isLive && (
                      <span className="px-1.5 py-0.5 bg-destructive text-destructive-foreground text-xs font-semibold rounded animate-pulse">
                        LIVE
                      </span>
                    )}
                    <span className="text-sm font-medium">{match.homeTeamName}</span>
                    {isFinished && homeScore !== null && awayScore !== null ? (
                      <span className="font-bold text-accent">
                        {homeScore} : {awayScore}
                      </span>
                    ) : (
                      <span className="font-bold text-accent">VS</span>
                    )}
                    <span className="text-sm font-medium">{match.awayTeamName}</span>
                    {match.date && (
                      <span className="text-xs text-primary-foreground/60">
                        {new Date(match.date).toLocaleDateString("ru-RU", {
                          weekday: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


