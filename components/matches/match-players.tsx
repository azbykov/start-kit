"use client";

import type { MatchPlayersResponse, MatchPlayer } from "@/lib/types/matches";
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
import { User, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface MatchPlayersProps {
  players: MatchPlayersResponse;
  isAdmin?: boolean;
  matchId?: string;
  onEditPlayer?: (player: MatchPlayer) => void;
  onDeletePlayer?: (player: MatchPlayer) => void;
  onAddPlayer?: (teamId: string, teamName: string) => void;
}

export function MatchPlayers({
  players,
  isAdmin = false,
  matchId,
  onEditPlayer,
  onDeletePlayer,
  onAddPlayer,
}: MatchPlayersProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Home Team */}
      <Card>
        <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-semibold">
            {players.homeTeam.teamName}
          </CardTitle>
          {isAdmin && onAddPlayer && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddPlayer(players.homeTeam.teamId, players.homeTeam.teamName)}
            >
              <Pencil />
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-2">
          {players.homeTeam.players.length > 0 ? (
            <div className="overflow-auto rounded-md border">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-normal">Игрок</TableHead>
                    <TableHead className="font-normal text-right">Г</TableHead>
                    <TableHead className="font-normal text-right">А</TableHead>
                    <TableHead className="font-normal text-right">ЖК</TableHead>
                    <TableHead className="font-normal text-right">КК</TableHead>
                    <TableHead className="font-normal text-right">Мин</TableHead>
                    {isAdmin && <TableHead className="font-normal text-right w-20"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.homeTeam.players.map((player) => (
                    <TableRow
                      key={player.id}
                      className={player.isStarter ? "bg-muted/50" : ""}
                    >
                      <TableCell>
                        <Link
                          href={`/players/${player.playerId}`}
                          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={player.playerImage || undefined}
                              alt={player.playerName}
                            />
                            <AvatarFallback className="bg-muted flex items-center justify-center">
                              <User className="h-3 w-3 text-muted-foreground" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-xs font-medium">
                              {player.playerName}
                            </span>
                            {player.playerPosition && player.playerPosition.length > 0 && (
                              <Badge variant="secondary" className="text-xs px-1 py-0">
                                {player.playerPosition[0]}
                              </Badge>
                            )}
                            {player.isStarter && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                С
                              </Badge>
                            )}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {player.goals}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {player.assists}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {player.yellowCards}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {player.redCards}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {player.minutesPlayed}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => onEditPlayer?.(player)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              onClick={() => onDeletePlayer?.(player)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              Игроки не добавлены
            </div>
          )}
        </CardContent>
      </Card>

      {/* Away Team */}
      <Card>
        <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-semibold">
            {players.awayTeam.teamName}
          </CardTitle>
          {isAdmin && onAddPlayer && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddPlayer(players.awayTeam.teamId, players.awayTeam.teamName)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-2">
          {players.awayTeam.players.length > 0 ? (
            <div className="overflow-auto rounded-md border">
              <Table className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-normal">Игрок</TableHead>
                    <TableHead className="font-normal text-right">Г</TableHead>
                    <TableHead className="font-normal text-right">А</TableHead>
                    <TableHead className="font-normal text-right">ЖК</TableHead>
                    <TableHead className="font-normal text-right">КК</TableHead>
                    <TableHead className="font-normal text-right">Мин</TableHead>
                    {isAdmin && <TableHead className="font-normal text-right w-20"></TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.awayTeam.players.map((player) => (
                    <TableRow
                      key={player.id}
                      className={player.isStarter ? "bg-muted/50" : ""}
                    >
                      <TableCell>
                        <Link
                          href={`/players/${player.playerId}`}
                          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                        >
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={player.playerImage || undefined}
                              alt={player.playerName}
                            />
                            <AvatarFallback className="bg-muted flex items-center justify-center">
                              <User className="h-3 w-3 text-muted-foreground" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex items-center gap-1 flex-wrap">
                            <span className="text-xs font-medium">
                              {player.playerName}
                            </span>
                            {player.playerPosition && player.playerPosition.length > 0 && (
                              <Badge variant="secondary" className="text-xs px-1 py-0">
                                {player.playerPosition[0]}
                              </Badge>
                            )}
                            {player.isStarter && (
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                С
                              </Badge>
                            )}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {player.goals}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {player.assists}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {player.yellowCards}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {player.redCards}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {player.minutesPlayed}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => onEditPlayer?.(player)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              onClick={() => onDeletePlayer?.(player)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              Игроки не добавлены
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

