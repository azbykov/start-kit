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
import Image from "next/image";
import Link from "next/link";
import type { TournamentTeamStatisticsRow } from "@/lib/types/tournaments";

interface TournamentTeamStatisticsProps {
  teams: TournamentTeamStatisticsRow[];
  isLoading?: boolean;
}

export function TournamentTeamStatistics({
  teams,
  isLoading = false,
}: TournamentTeamStatisticsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Статистика команд
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-4">
            Загрузка...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (teams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Статистика команд
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-4">
            Нет данных для отображения
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Статистика команд
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto rounded-md border">
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="font-normal w-8">#</TableHead>
                <TableHead className="font-normal">Команда</TableHead>
                <TableHead className="font-normal text-right">И</TableHead>
                <TableHead className="font-normal text-right">В</TableHead>
                <TableHead className="font-normal text-right">Н</TableHead>
                <TableHead className="font-normal text-right">П</TableHead>
                <TableHead className="font-normal text-right">З</TableHead>
                <TableHead className="font-normal text-right">П</TableHead>
                <TableHead className="font-normal text-right">Р</TableHead>
                <TableHead className="font-normal text-right font-semibold">
                  О
                </TableHead>
                <TableHead className="font-normal text-right">А</TableHead>
                <TableHead className="font-normal text-right">ЖК</TableHead>
                <TableHead className="font-normal text-right">КК</TableHead>
                <TableHead className="font-normal text-right">Мин</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((row, index) => (
                <TableRow
                  key={row.team.id}
                  className={index < 3 ? "bg-muted/50" : ""}
                >
                  <TableCell className="text-xs font-medium">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/teams/${row.team.id}`}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      {row.team.logo ? (
                        <div className="relative h-6 w-6 rounded overflow-hidden border flex-shrink-0">
                          <Image
                            src={row.team.logo}
                            alt={row.team.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded border bg-muted flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium">
                            {row.team.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-xs font-medium truncate">
                        {row.team.name}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right text-xs">{row.played}</TableCell>
                  <TableCell className="text-right text-xs">{row.wins}</TableCell>
                  <TableCell className="text-right text-xs">{row.draws}</TableCell>
                  <TableCell className="text-right text-xs">{row.losses}</TableCell>
                  <TableCell className="text-right text-xs">
                    {row.goalsFor}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {row.goalsAgainst}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {row.goalDifference > 0 ? "+" : ""}
                    {row.goalDifference}
                  </TableCell>
                  <TableCell className="text-right text-xs font-semibold">
                    {row.points}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {row.assists}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {row.yellowCards}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {row.redCards}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {row.minutesPlayed}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          И — Игры, В — Победы, Н — Ничьи, П — Поражения, З — Забито, П —
          Пропущено, Р — Разница, О — Очки, А — Ассисты, ЖК — Желтые карточки,
          КК — Красные карточки, Мин — Минуты
        </div>
      </CardContent>
    </Card>
  );
}

