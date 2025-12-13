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
import { Trophy } from "lucide-react";
import { TournamentMatches } from "./tournament-matches";

interface Standing {
  team: {
    id: string;
    name: string;
    logo: string | null;
  };
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

interface TournamentStandingsProps {
  standings: Standing[];
  matches?: Array<{
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
  }>;
  isLoading?: boolean;
  isAdmin?: boolean;
}

export function TournamentStandings({
  standings,
  matches,
  isLoading = false,
  isAdmin = false,
}: TournamentStandingsProps) {
  if (isLoading) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Таблица результатов</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground text-center py-4">
              Загрузка...
            </div>
          </CardContent>
        </Card>
        {matches && (
          <TournamentMatches
            matches={matches}
            isLoading={true}
            isAdmin={isAdmin}
          />
        )}
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Таблица результатов</CardTitle>
        </CardHeader>
        <CardContent>
          {standings.length > 0 ? (
            <>
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
                      <TableHead className="font-normal text-right font-semibold">О</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {standings.map((standing, index) => (
                      <TableRow
                        key={standing.team.id}
                        className={index < 3 ? "bg-muted/50" : ""}
                      >
                        <TableCell className="text-xs font-medium">
                          {index + 1}
                          {index === 0 && (
                            <Trophy className="h-3 w-3 inline-block ml-1 text-yellow-500" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/teams/${standing.team.id}`}
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                          >
                            {standing.team.logo ? (
                              <div className="relative h-6 w-6 rounded overflow-hidden border flex-shrink-0">
                                <Image
                                  src={standing.team.logo}
                                  alt={standing.team.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-6 w-6 rounded border bg-muted flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium">
                                  {standing.team.name.substring(0, 2).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <span className="text-xs font-medium truncate">
                              {standing.team.name}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {standing.played}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {standing.wins}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {standing.draws}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {standing.losses}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {standing.goalsFor}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {standing.goalsAgainst}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {standing.goalDifference > 0 ? "+" : ""}
                          {standing.goalDifference}
                        </TableCell>
                        <TableCell className="text-right text-xs font-semibold">
                          {standing.points}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  </Table>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  И — Игры, В — Победы, Н — Ничьи, П — Поражения, З — Забито, П — Пропущено, Р — Разница, О — Очки
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                Нет данных для отображения
              </div>
            )}
          </CardContent>
        </Card>

        {/* Matches Section */}
        {matches && (
          <TournamentMatches
            matches={matches}
            isLoading={false}
            isAdmin={isAdmin}
          />
        )}
      </>
    );
  }

