"use client";

import type { MatchProfile, MatchPlayersResponse } from "@/lib/types/matches";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Calendar, Clock, MapPin, Trophy, Pencil, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-semibold">О матче</CardTitle>
          {isAdmin && onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
            >
              <Pencil />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Score */}
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex items-center justify-center gap-6 w-full">
                <div className="flex items-center gap-3">
                  <Link href={`/teams/${match.homeTeam.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    {match.homeTeam.logo ? (
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden border">
                        <Image
                          src={match.homeTeam.logo}
                          alt={match.homeTeam.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-lg border bg-muted flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {match.homeTeam.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-lg font-semibold">{match.homeTeam.name}</span>
                  </Link>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="text-2xl font-bold">
                    {finalScore ? (
                      <>
                        {finalScore.home} : {finalScore.away}
                        {finalScore.suffix && (
                          <span className="text-sm font-normal text-muted-foreground ml-2">
                            {finalScore.suffix}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                  {/* Показываем основной счет если есть финальный по пенальти или доп. времени */}
                  {finalScore && finalScore.suffix && (
                    <div className="text-sm text-muted-foreground">
                      Основное время: {match.homeScore ?? 0}:{match.awayScore ?? 0}
                    </div>
                  )}
                  {/* Показываем промежуточные счета если есть */}
                  {match.homeScoreHT !== null && match.awayScoreHT !== null && (
                    <div className="text-xs text-muted-foreground">
                      Первый тайм: {match.homeScoreHT}:{match.awayScoreHT}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Link href={`/teams/${match.awayTeam.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <span className="text-lg font-semibold">{match.awayTeam.name}</span>
                    {match.awayTeam.logo ? (
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden border">
                        <Image
                          src={match.awayTeam.logo}
                          alt={match.awayTeam.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-lg border bg-muted flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {match.awayTeam.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </Link>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Дата: </span>
                <span className="font-medium">{formatDate(match.date)}</span>
              </div>
              {match.time && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Время: </span>
                  <span className="font-medium">{match.time}</span>
                </div>
              )}
              {match.stadium && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Стадион: </span>
                  <span className="font-medium">{match.stadium}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Статус: </span>
                {getStatusBadge(match.status)}
              </div>
              {match.status === "FINISHED" && (
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Время матча: </span>
                  <span className="font-medium">{getMatchDuration(match.duration, players)}</span>
                </div>
              )}
            </div>

            {match.tournament && (
              <div className="flex items-center gap-2 pt-2 border-t">
                <Trophy className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Турнир: </span>
                <Link
                  href={`/tournaments/${match.tournament.id}`}
                  className="font-medium hover:underline"
                >
                  {match.tournament.name}
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

