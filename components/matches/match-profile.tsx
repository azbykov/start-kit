"use client";

import type { MatchProfile, MatchPlayersResponse } from "@/lib/types/matches";
import {
  Card,
} from "@/components/ui/card";
import Image from "next/image";
import { Calendar, Clock, MapPin, Trophy, Pencil, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface MatchProfileProps {
  match: MatchProfile;
  players?: MatchPlayersResponse;
  isAdmin?: boolean;
  onEdit?: () => void;
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    SCHEDULED: "outline",
    LIVE: "default",
    FINISHED: "secondary",
    CANCELLED: "destructive",
  };
  const labels: Record<string, string> = {
    SCHEDULED: "Запланирован",
    LIVE: "В эфире",
    FINISHED: "Завершен",
    CANCELLED: "Отменен",
  };
  return (
    <Badge variant={variants[status] || "secondary"}>
      {labels[status] || status}
    </Badge>
  );
};

const getFinalScore = (match: MatchProfile) => {
  // Если есть счет по пенальти, показываем его как финальный
  if (match.homeScoreP !== null && match.homeScoreP !== undefined && 
      match.awayScoreP !== null && match.awayScoreP !== undefined) {
    return {
      home: match.homeScoreP,
      away: match.awayScoreP,
      suffix: " (пен.)",
    };
  }
  // Если есть счет после дополнительного времени
  if (match.homeScoreET !== null && match.homeScoreET !== undefined && 
      match.awayScoreET !== null && match.awayScoreET !== undefined) {
    return {
      home: match.homeScoreET,
      away: match.awayScoreET,
      suffix: " (доп. время)",
    };
  }
  // Обычный счет - показываем всегда, заменяя null на 0
  return {
    home: match.homeScore ?? 0,
    away: match.awayScore ?? 0,
    suffix: "",
  };
};

const getMatchDuration = (
  duration: string | null | undefined,
  players?: MatchPlayersResponse
): string => {
  // Если есть duration, используем его
  if (duration) {
    const durationMap: Record<string, string> = {
      Regular: "90 мин",
      ExtraTime: "120 мин",
      Penalties: "120 мин + пенальти",
    };
    return durationMap[duration] || duration;
  }
  
  // Иначе вычисляем из максимального времени игроков
  if (players) {
    const allPlayers = [
      ...players.homeTeam.players,
      ...players.awayTeam.players,
    ];
    if (allPlayers.length > 0) {
      const maxMinutes = Math.max(
        ...allPlayers.map((p) => p.minutesPlayed)
      );
      if (maxMinutes > 0) {
        return `${maxMinutes} мин`;
      }
    }
  }
  
  return "90 мин";
};

export function MatchProfileComponent({
  match,
  players,
  isAdmin = false,
  onEdit,
}: MatchProfileProps) {
  const finalScore = getFinalScore(match);

  return (
    <Card className="mb-8 overflow-hidden">
      <div className="gradient-hero p-6 lg:p-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          {match.tournament && (
            <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
              <Trophy className="w-3 h-3 mr-1" />
              {match.tournament.name}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-center gap-6 lg:gap-12">
          {/* Home Team */}
          <div className="flex flex-col items-center gap-3">
            {match.homeTeam.logo ? (
              <div className="relative h-20 w-20 lg:h-24 lg:w-24 rounded-lg overflow-hidden border-2 border-primary-foreground/20 bg-primary-foreground/20">
                <Image
                  src={match.homeTeam.logo}
                  alt={match.homeTeam.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-20 w-20 lg:h-24 lg:w-24 rounded-lg border-2 border-primary-foreground/20 bg-primary-foreground/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">
                  {match.homeTeam.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-primary-foreground font-semibold text-lg">
              {match.homeTeam.name}
            </span>
          </div>

          {/* Score */}
          <div className="text-center">
            <div className="text-primary-foreground text-5xl lg:text-6xl font-bold">
              {finalScore.home} : {finalScore.away}
            </div>
            {finalScore.suffix && (
              <div className="text-primary-foreground/80 text-sm mt-1">{finalScore.suffix}</div>
            )}
            {getStatusBadge(match.status)}
          </div>

          {/* Away Team */}
          <div className="flex flex-col items-center gap-3">
            {match.awayTeam.logo ? (
              <div className="relative h-20 w-20 lg:h-24 lg:w-24 rounded-lg overflow-hidden border-2 border-primary-foreground/20 bg-primary-foreground/20">
                <Image
                  src={match.awayTeam.logo}
                  alt={match.awayTeam.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-20 w-20 lg:h-24 lg:w-24 rounded-lg border-2 border-primary-foreground/20 bg-primary-foreground/20 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-foreground">
                  {match.awayTeam.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-primary-foreground font-semibold text-lg">
              {match.awayTeam.name}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-6 text-primary-foreground/80 text-sm flex-wrap">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(match.date)}
          </div>
          {match.time && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {match.time}
            </div>
          )}
          {(match.stadium || match.venue) && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {match.stadium || match.venue}
            </div>
          )}
          {match.status === "FINISHED" && (
            <div className="flex items-center gap-1">
              <Timer className="w-4 h-4" />
              {getMatchDuration(match.duration, players)}
            </div>
          )}
        </div>

        {isAdmin && onEdit && (
          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm" onClick={onEdit} className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20">
              <Pencil className="w-4 h-4 mr-2" />
              Редактировать
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

