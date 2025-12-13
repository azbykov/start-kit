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
import { BarChart3 } from "lucide-react";
import type { PlayerEventsResponse } from "@/lib/types/players";

interface PlayerEventsStatisticsProps {
  data: PlayerEventsResponse;
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (eventSec: number, matchPeriod: string) => {
  const minutes = Math.floor(eventSec / 60);
  const periodMap: Record<string, string> = {
    "1H": "1-й тайм",
    "2H": "2-й тайм",
    ET1: "Доп. время 1",
    ET2: "Доп. время 2",
    P: "Пенальти",
  };
  return `${periodMap[matchPeriod] || matchPeriod} ${minutes}'`;
};

export function PlayerEventsStatistics({
  data,
}: PlayerEventsStatisticsProps) {
  return (
    <div className="space-y-4">
      {/* Statistics summary */}
      {data.statistics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Сводная статистика событий
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Тип события</TableHead>
                    <TableHead className="text-xs">Подтип</TableHead>
                    <TableHead className="text-xs text-right">Количество</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.statistics.map((stat, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-xs font-medium">
                        {stat.eventName}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {stat.subEventName || "—"}
                      </TableCell>
                      <TableCell className="text-xs text-right font-semibold">
                        {stat.count}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All events table */}
      {data.events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Все события ({data.events.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Дата матча</TableHead>
                    <TableHead className="text-xs">Матч</TableHead>
                    <TableHead className="text-xs">Событие</TableHead>
                    <TableHead className="text-xs">Время</TableHead>
                    <TableHead className="text-xs">Команда</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="text-xs">
                        {formatDate(event.match.date)}
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex flex-col gap-1">
                          <span>
                            {event.match.homeTeam.name} —{" "}
                            {event.match.awayTeam.name}
                          </span>
                          {event.match.tournament && (
                            <span className="text-muted-foreground text-xs">
                              {event.match.tournament.name}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{event.eventName}</span>
                          {event.subEventName && (
                            <span className="text-muted-foreground text-xs">
                              {event.subEventName}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {formatTime(event.eventSec, event.matchPeriod)}
                      </TableCell>
                      <TableCell className="text-xs">
                        {event.team.name}
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
      {data.events.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-2">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm text-muted-foreground">
                События не найдены
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
