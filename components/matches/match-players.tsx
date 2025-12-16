"use client";

import type { MatchPlayersResponse, MatchPlayer } from "@/lib/types/matches";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Pencil, Trash2 } from "lucide-react";
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
  const homeStarters = players.homeTeam.players.filter((p) => p.isStarter);
  const homeSubstitutes = players.homeTeam.players.filter((p) => !p.isStarter);
  const awayStarters = players.awayTeam.players.filter((p) => p.isStarter);
  const awaySubstitutes = players.awayTeam.players.filter((p) => !p.isStarter);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Home Team */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {players.homeTeam.teamName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{players.homeTeam.teamName}</CardTitle>
                <p className="text-sm text-muted-foreground">Схема: 4-3-3</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3 text-sm text-muted-foreground">
                Основной состав
              </h4>
              <div className="space-y-2">
                {homeStarters.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground text-sm font-bold">
                        {player.positionInFormation || "—"}
                      </span>
                    </div>
                    <Link
                      href={`/players/${player.playerId}`}
                      className="flex-1 font-medium hover:underline"
                    >
                      {player.playerName}
                    </Link>
                    <Badge variant="outline" className="text-xs">
                      {player.playerPosition?.[0] || "—"}
                    </Badge>
                    {isAdmin && (
                      <div className="flex items-center gap-1">
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
                    )}
                  </div>
                ))}
              </div>
            </div>
            {homeSubstitutes.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-sm text-muted-foreground">Запасные</h4>
                <div className="space-y-2">
                  {homeSubstitutes.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-muted-foreground text-sm font-bold">
                          {player.positionInFormation || "—"}
                        </span>
                      </div>
                      <Link
                        href={`/players/${player.playerId}`}
                        className="flex-1 font-medium text-muted-foreground hover:underline"
                      >
                        {player.playerName}
                      </Link>
                      <Badge variant="outline" className="text-xs">
                        {player.playerPosition?.[0] || "—"}
                      </Badge>
                      {isAdmin && (
                        <div className="flex items-center gap-1">
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
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {isAdmin && onAddPlayer && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onAddPlayer(players.homeTeam.teamId, players.homeTeam.teamName)}
              >
                Добавить игрока
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Away Team */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-secondary-foreground/20 text-secondary-foreground">
                  {players.awayTeam.teamName.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{players.awayTeam.teamName}</CardTitle>
                <p className="text-sm text-muted-foreground">Схема: 4-4-2</p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3 text-sm text-muted-foreground">
                Основной состав
              </h4>
              <div className="space-y-2">
                {awayStarters.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-secondary-foreground/20 rounded-full flex items-center justify-center">
                      <span className="text-secondary-foreground text-sm font-bold">
                        {player.positionInFormation || "—"}
                      </span>
                    </div>
                    <Link
                      href={`/players/${player.playerId}`}
                      className="flex-1 font-medium hover:underline"
                    >
                      {player.playerName}
                    </Link>
                    <Badge variant="outline" className="text-xs">
                      {player.playerPosition?.[0] || "—"}
                    </Badge>
                    {isAdmin && (
                      <div className="flex items-center gap-1">
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
                    )}
                  </div>
                ))}
              </div>
            </div>
            {awaySubstitutes.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 text-sm text-muted-foreground">Запасные</h4>
                <div className="space-y-2">
                  {awaySubstitutes.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-muted-foreground text-sm font-bold">
                          {player.positionInFormation || "—"}
                        </span>
                      </div>
                      <Link
                        href={`/players/${player.playerId}`}
                        className="flex-1 font-medium text-muted-foreground hover:underline"
                      >
                        {player.playerName}
                      </Link>
                      <Badge variant="outline" className="text-xs">
                        {player.playerPosition?.[0] || "—"}
                      </Badge>
                      {isAdmin && (
                        <div className="flex items-center gap-1">
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
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {isAdmin && onAddPlayer && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onAddPlayer(players.awayTeam.teamId, players.awayTeam.teamName)}
              >
                Добавить игрока
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
