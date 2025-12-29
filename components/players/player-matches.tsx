"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Clock, BarChart3 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PlayerMatchesResponse } from "@/lib/types/players";

interface PlayerMatchesProps {
  data: PlayerMatchesResponse;
  playerId: string;
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusBadge = (status: string) => {
  const variants: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
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

export function PlayerMatches({ data, playerId }: PlayerMatchesProps) {
  return (
    <div className="space-y-4">
      {/* Upcoming matches */}
      {data.upcoming.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Предстоящие матчи
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Дата</TableHead>
                    <TableHead className="text-xs">Турнир</TableHead>
                    <TableHead className="text-xs">Команды</TableHead>
                    <TableHead className="text-xs text-right">Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.upcoming.map((item) => (
                    <TableRow key={item.match.id}>
                      <TableCell className="text-xs">
                        <div className="flex flex-col gap-1">
                          <span>{formatDate(item.match.date)}</span>
                          {item.match.time && (
                            <span className="text-muted-foreground text-xs flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {item.match.time}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {item.match.tournament ? (
                          <Link
                            href={`/tournaments/${item.match.tournament.id}`}
                            className="flex items-center gap-2 hover:underline"
                          >
                            {item.match.tournament.logo && (
                              <Image
                                src={item.match.tournament.logo}
                                alt={item.match.tournament.name}
                                width={16}
                                height={16}
                                className="rounded"
                              />
                            )}
                            <span>{item.match.tournament.name}</span>
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        <Link
                          href={`/matches/${item.match.id}`}
                          className="hover:underline"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={
                                item.match.homeTeam.id === item.team.id
                                  ? "font-semibold"
                                  : ""
                              }
                            >
                              {item.match.homeTeam.name}
                            </span>
                            <span className="text-muted-foreground">—</span>
                            <span
                              className={
                                item.match.awayTeam.id === item.team.id
                                  ? "font-semibold"
                                  : ""
                              }
                            >
                              {item.match.awayTeam.name}
                            </span>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {getStatusBadge(item.match.status)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past matches */}
      {data.past.length > 0 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Прошедшие матчи
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Турнир</TableHead>
                  <TableHead>Команды</TableHead>
                  <TableHead>Счет</TableHead>
                  <TableHead>Статистика</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.past.map((item) => (
                  <TableRow key={item.match.id}>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {formatDate(item.match.date)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.match.tournament ? (
                        <Link
                          href={`/tournaments/${item.match.tournament.id}`}
                          className="flex items-center gap-2 hover:underline"
                        >
                          {item.match.tournament.logo && (
                            <Image
                              src={item.match.tournament.logo}
                              alt={item.match.tournament.name}
                              width={16}
                              height={16}
                              className="rounded"
                            />
                          )}
                          <span>{item.match.tournament.name}</span>
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link href={`/matches/${item.match.id}`} className="hover:underline">
                        <div className="flex items-center gap-1">
                          <span
                            className={
                              item.match.homeTeam.id === item.team.id
                                ? "font-semibold"
                                : "text-muted-foreground"
                            }
                          >
                            {item.match.homeTeam.name}
                          </span>
                          <span className="mx-1">—</span>
                          <span
                            className={
                              item.match.awayTeam.id === item.team.id
                                ? "font-semibold"
                                : "font-medium"
                            }
                          >
                            {item.match.awayTeam.name}
                          </span>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      {item.match.homeScore !== null && item.match.awayScore !== null ? (
                        <span>
                          {item.match.homeScore}:{item.match.awayScore}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Голов: {item.playerStats.goals}</div>
                        <div className="text-muted-foreground">
                          Передач: {item.playerStats.assists}
                        </div>
                      </div>
                      <div className="text-xs text-primary mt-1">
                        {item.playerStats.minutesPlayed} мин
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/players/${playerId}/matches/${item.match.id}/stats`}>
                        <Button variant="outline" size="sm" className="gap-1">
                          <BarChart3 className="w-4 h-4" />
                          Статистика
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {data.upcoming.length === 0 && data.past.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-2">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm text-muted-foreground">
                Матчи не найдены
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
