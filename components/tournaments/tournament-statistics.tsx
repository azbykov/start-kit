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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import Link from "next/link";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PlayerStatistic {
  player: {
    id: string;
    firstName: string;
    lastName: string;
    image: string | null;
    position: string[];
  };
  team: {
    id: string;
    name: string;
    logo: string | null;
  };
  matches: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
}

interface TournamentStatisticsProps {
  statistics: PlayerStatistic[];
  isLoading?: boolean;
}

export function TournamentStatistics({
  statistics,
  isLoading = false,
}: TournamentStatisticsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Статистика игроков</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-4">
            Загрузка...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (statistics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Статистика игроков</CardTitle>
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
        <CardTitle className="text-base font-semibold">Статистика игроков</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto rounded-md border">
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="font-normal w-8">#</TableHead>
                <TableHead className="font-normal">Игрок</TableHead>
                <TableHead className="font-normal">Команда</TableHead>
                <TableHead className="font-normal text-right">И</TableHead>
                <TableHead className="font-normal text-right font-semibold">Г</TableHead>
                <TableHead className="font-normal text-right">А</TableHead>
                <TableHead className="font-normal text-right">ЖК</TableHead>
                <TableHead className="font-normal text-right">КК</TableHead>
                <TableHead className="font-normal text-right">Мин</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statistics.map((stat, index) => (
                <TableRow
                  key={stat.player.id}
                  className={index < 3 ? "bg-muted/50" : ""}
                >
                  <TableCell className="text-xs font-medium">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/players/${stat.player.id}`}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={stat.player.image || undefined}
                          alt={`${stat.player.firstName} ${stat.player.lastName}`}
                        />
                        <AvatarFallback className="bg-muted flex items-center justify-center">
                          <User className="h-3 w-3 text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-xs font-medium">
                          {stat.player.firstName} {stat.player.lastName}
                        </span>
                        {stat.player.position && stat.player.position.length > 0 && (
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            {stat.player.position[0]}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/teams/${stat.team.id}`}
                      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                      {stat.team.logo ? (
                        <div className="relative h-6 w-6 rounded overflow-hidden border flex-shrink-0">
                          <Image
                            src={stat.team.logo}
                            alt={stat.team.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded border bg-muted flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium">
                            {stat.team.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-xs truncate">
                        {stat.team.name}
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {stat.matches}
                  </TableCell>
                  <TableCell className="text-right text-xs font-semibold">
                    {stat.goals}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {stat.assists}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {stat.yellowCards}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {stat.redCards}
                  </TableCell>
                  <TableCell className="text-right text-xs">
                    {stat.minutesPlayed}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          И — Игры, Г — Голы, А — Ассисты, ЖК — Желтые карточки, КК — Красные карточки, Мин — Минуты
        </div>
      </CardContent>
    </Card>
  );
}

