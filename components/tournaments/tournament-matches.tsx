"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

interface Match {
  id: string;
  date: string;
  time: string | null;
  stadium: string | null;
  status: string;
  homeTeam: {
    id: string;
    name: string;
    logo: string | null;
  };
  awayTeam: {
    id: string;
    name: string;
    logo: string | null;
  };
  homeScore: number | null;
  awayScore: number | null;
  createdAt: string;
}

interface TournamentMatchesProps {
  matches: Match[];
  isLoading?: boolean;
  isAdmin?: boolean;
}

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
    <Badge variant={variants[status] || "secondary"} className="text-xs">
      {labels[status] || status}
    </Badge>
  );
};

export function TournamentMatches({
  matches,
  isLoading = false,
  isAdmin: _isAdmin = false,
}: TournamentMatchesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Матчи</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-4">
            Загрузка...
          </div>
        </CardContent>
      </Card>
    );
  }

  const now = new Date();
  const upcomingMatches = matches.filter((match) => {
    const matchDate = new Date(match.date);
    return matchDate >= now && match.status !== "FINISHED" && match.status !== "CANCELLED";
  });

  const finishedMatches = matches.filter((match) => {
    return match.status === "FINISHED";
  });

  return (
    <div className="space-y-4">
      {/* Upcoming Matches */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Предстоящие матчи</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingMatches.length > 0 ? (
            <div className="space-y-3">
              {upcomingMatches.map((match) => (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {match.homeTeam.logo ? (
                          <div className="relative h-8 w-8 rounded overflow-hidden border flex-shrink-0">
                            <Image
                              src={match.homeTeam.logo}
                              alt={match.homeTeam.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded border bg-muted flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium">
                              {match.homeTeam.name.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="text-sm font-medium truncate">
                          {match.homeTeam.name}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground flex-shrink-0">
                        {match.date && formatDate(match.date)}
                        {match.time && ` ${match.time}`}
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                        <span className="text-sm font-medium truncate">
                          {match.awayTeam.name}
                        </span>
                        {match.awayTeam.logo ? (
                          <div className="relative h-8 w-8 rounded overflow-hidden border flex-shrink-0">
                            <Image
                              src={match.awayTeam.logo}
                              alt={match.awayTeam.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded border bg-muted flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium">
                              {match.awayTeam.name.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(match.status)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              Нет предстоящих матчей
            </div>
          )}
        </CardContent>
      </Card>

      {/* Finished Matches */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Прошедшие матчи</CardTitle>
        </CardHeader>
        <CardContent>
          {finishedMatches.length > 0 ? (
            <div className="space-y-3">
              {finishedMatches.map((match) => (
                <Link
                  key={match.id}
                  href={`/matches/${match.id}`}
                  className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {match.homeTeam.logo ? (
                          <div className="relative h-8 w-8 rounded overflow-hidden border flex-shrink-0">
                            <Image
                              src={match.homeTeam.logo}
                              alt={match.homeTeam.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded border bg-muted flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium">
                              {match.homeTeam.name.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="text-sm font-medium truncate">
                          {match.homeTeam.name}
                        </span>
                      </div>
                      <div className="text-lg font-bold flex-shrink-0">
                        {match.homeScore ?? 0} : {match.awayScore ?? 0}
                      </div>
                      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                        <span className="text-sm font-medium truncate">
                          {match.awayTeam.name}
                        </span>
                        {match.awayTeam.logo ? (
                          <div className="relative h-8 w-8 rounded overflow-hidden border flex-shrink-0">
                            <Image
                              src={match.awayTeam.logo}
                              alt={match.awayTeam.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded border bg-muted flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium">
                              {match.awayTeam.name.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground flex-shrink-0">
                      {match.date && formatDate(match.date)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              Нет прошедших матчей
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

