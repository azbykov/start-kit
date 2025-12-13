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
import { Calendar, Trophy, Clock, BarChart3 } from "lucide-react";
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
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Прошедшие матчи
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
                    <TableHead className="text-xs text-center">Счет</TableHead>
                    <TableHead className="text-xs text-right">Статистика</TableHead>
                    <TableHead className="text-xs text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.past.map((item) => (
                    <TableRow key={item.match.id}>
                      <TableCell className="text-xs">
                        {formatDate(item.match.date)}
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
                      <TableCell className="text-xs text-center">
                        {item.match.homeScore !== null &&
                        item.match.awayScore !== null ? (
                          <span>
                            {item.match.homeScore}:{item.match.awayScore}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        <div className="flex flex-col gap-1 items-end">
                          {item.playerStats.goals > 0 && (
                            <span className="text-xs">
                              Голов: {item.playerStats.goals}
                            </span>
                          )}
                          {item.playerStats.assists > 0 && (
                            <span className="text-xs">
                              Передач: {item.playerStats.assists}
                            </span>
                          )}
                          {item.playerStats.minutesPlayed > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {item.playerStats.minutesPlayed} мин
                            </span>
                          )}
                          {item.playerStats.yellowCards > 0 && (
                            <span className="text-xs text-yellow-600">
                              ЖК: {item.playerStats.yellowCards}
                            </span>
                          )}
                          {item.playerStats.redCards > 0 && (
                            <span className="text-xs text-red-600">
                              КК: {item.playerStats.redCards}
                            </span>
                          )}
                          {!item.playerStats.goals &&
                            !item.playerStats.assists &&
                            item.playerStats.minutesPlayed === 0 && (
                              <span className="text-xs text-muted-foreground">
                                {item.playerStats.isStarter
                                  ? "В старте"
                                  : "На скамейке"}
                              </span>
                            )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        <Link href={`/players/${playerId}/matches/${item.match.id}/stats`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                          >
                            <BarChart3 className="h-3 w-3 mr-1" />
                            Статистика
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
