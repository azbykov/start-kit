"use client";

import Link from "next/link";
import { Calendar, Clock, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Match } from "@/lib/types/matches";

interface MatchCardProps {
  match: Match;
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export function MatchCard({ match }: MatchCardProps) {
  const getStatusBadge = () => {
    switch (match.status) {
      case "LIVE":
        return (
          <Badge className="bg-destructive text-destructive-foreground animate-pulse">
            LIVE
          </Badge>
        );
      case "FINISHED":
        return <Badge variant="secondary">Завершён</Badge>;
      case "SCHEDULED":
        return <Badge variant="outline">Скоро</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Отменён</Badge>;
      default:
        return <Badge variant="outline">—</Badge>;
    }
  };

  const isUpcoming = match.status === "SCHEDULED";

  return (
    <div className="group bg-card border border-border rounded-xl p-4 lg:p-6 hover:shadow-card transition-all duration-300 hover:border-primary/30">
      <div className="flex items-center justify-between mb-4">
        {match.tournamentName && (
          <Badge variant="outline" className="text-xs">
            {match.tournamentName}
          </Badge>
        )}
        {getStatusBadge()}
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Home Team */}
        <div className="flex-1 text-center">
          {match.homeTeamLogo ? (
            <Avatar className="w-16 h-16 mx-auto mb-2">
              <AvatarImage src={match.homeTeamLogo} alt={match.homeTeamName} />
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                {match.homeTeamName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-16 h-16 mx-auto mb-2 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-secondary-foreground">
                {match.homeTeamName.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <p className="font-semibold text-foreground text-sm lg:text-base">
            {match.homeTeamName}
          </p>
        </div>

        {/* Score */}
        <div className="text-center px-4">
          {isUpcoming ? (
            <div className="text-muted-foreground">
              <p className="text-2xl font-bold">VS</p>
              {match.time && <p className="text-sm mt-1">{match.time}</p>}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span
                className={`text-3xl lg:text-4xl font-bold ${
                  match.homeScore !== null &&
                  match.awayScore !== null &&
                  match.homeScore > match.awayScore
                    ? "text-primary"
                    : "text-foreground"
                }`}
              >
                {match.homeScore ?? 0}
              </span>
              <span className="text-2xl text-muted-foreground">:</span>
              <span
                className={`text-3xl lg:text-4xl font-bold ${
                  match.homeScore !== null &&
                  match.awayScore !== null &&
                  match.awayScore > match.homeScore
                    ? "text-primary"
                    : "text-foreground"
                }`}
              >
                {match.awayScore ?? 0}
              </span>
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex-1 text-center">
          {match.awayTeamLogo ? (
            <Avatar className="w-16 h-16 mx-auto mb-2">
              <AvatarImage src={match.awayTeamLogo} alt={match.awayTeamName} />
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                {match.awayTeamName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-16 h-16 mx-auto mb-2 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-lg font-bold text-secondary-foreground">
                {match.awayTeamName.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <p className="font-semibold text-foreground text-sm lg:text-base">
            {match.awayTeamName}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(match.date)}
          </span>
          {match.time && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {match.time}
            </span>
          )}
        </div>
        {(match.stadium || match.venue) && (
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {match.stadium || match.venue}
          </span>
        )}
      </div>

      <Link href={`/matches/${match.id}`}>
        <Button variant="ghost" className="w-full mt-4 group-hover:bg-primary/5">
          Подробнее <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </Link>
    </div>
  );
}



