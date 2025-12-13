"use client";

import type { MatchPlayersResponse } from "@/lib/types/matches";
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

interface MatchStatsProps {
  players: MatchPlayersResponse;
}

export function MatchStats({ players }: MatchStatsProps) {
  const homeStats = {
    goals: players.homeTeam.players.reduce((sum, p) => sum + p.goals, 0),
    assists: players.homeTeam.players.reduce((sum, p) => sum + p.assists, 0),
    yellowCards: players.homeTeam.players.reduce((sum, p) => sum + p.yellowCards, 0),
    redCards: players.homeTeam.players.reduce((sum, p) => sum + p.redCards, 0),
    shots: 0, // TODO: добавить когда будет в данных
    possession: 0, // TODO: добавить когда будет в данных
  };

  const awayStats = {
    goals: players.awayTeam.players.reduce((sum, p) => sum + p.goals, 0),
    assists: players.awayTeam.players.reduce((sum, p) => sum + p.assists, 0),
    yellowCards: players.awayTeam.players.reduce((sum, p) => sum + p.yellowCards, 0),
    redCards: players.awayTeam.players.reduce((sum, p) => sum + p.redCards, 0),
    shots: 0,
    possession: 0,
  };

  const stats = [
    { label: "Голы", home: homeStats.goals, away: awayStats.goals },
    { label: "Голевые передачи", home: homeStats.assists, away: awayStats.assists },
    { label: "Желтые карточки", home: homeStats.yellowCards, away: awayStats.yellowCards },
    { label: "Красные карточки", home: homeStats.redCards, away: awayStats.redCards },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Статистика</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-normal w-1/3">{players.homeTeam.teamName}</TableHead>
                <TableHead className="font-normal text-center w-1/3">Показатель</TableHead>
                <TableHead className="font-normal text-right w-1/3">{players.awayTeam.teamName}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((stat) => (
                <TableRow key={stat.label}>
                  <TableCell className="text-right text-sm font-medium">
                    {stat.home}
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {stat.label}
                  </TableCell>
                  <TableCell className="text-left text-sm font-medium">
                    {stat.away}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}


