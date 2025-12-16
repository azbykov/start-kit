"use client";

import { use, useEffect, useState } from "react";
import { useTeamProfile, useTeamPlayers, useTeamTournaments, useTeamMatches } from "@/lib/hooks/use-teams";
import { TeamProfileComponent } from "@/components/teams/team-profile";
import { TeamForm } from "@/components/teams/team-form";
import { PlayerForm } from "@/components/players/player-form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { usePageTitle } from "@/components/layout/page-title-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Trophy } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PositionBadges } from "@/components/players/position-badge";
import { sortPlayersByPosition } from "@/lib/utils/player";
import { Position } from "@prisma/client";
import { useSession } from "next-auth/react";
import { canManageTeam } from "@/lib/auth/roles-client";
import type { Team } from "@/lib/types/teams";
import { DetailPageNav } from "@/components/layout/detail-page-nav";

interface TeamProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function TeamProfilePage({ params }: TeamProfilePageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { data: team, isLoading, error, refetch: refetchTeam } = useTeamProfile(id);
  const { data: players, isLoading: playersLoading, refetch: refetchPlayers } = useTeamPlayers(id);
  const { data: tournaments, isLoading: tournamentsLoading } = useTeamTournaments(id);
  const { data: matches, isLoading: matchesLoading } = useTeamMatches(id);
  const { setTitle, setShowBackButton } = usePageTitle();
  const { data: session } = useSession();

  // Check if user can manage this team
  const canManage = canManageTeam(session, id);

  // Modal states
  const [editTeamDialogOpen, setEditTeamDialogOpen] = useState(false);
  const [createPlayerDialogOpen, setCreatePlayerDialogOpen] = useState(false);

  // Convert TeamProfile to Team for form
  const teamForForm: Team | null = team
    ? {
        id: team.id,
        name: team.name,
        logo: team.logo,
        coach: team.coach,
        city: team.city,
        country: team.country,
        isActive: team.isActive,
        createdAt: new Date().toISOString(), // Not used in form
        updatedAt: new Date().toISOString(), // Not used in form
      }
    : null;

  // Update header with team info
  useEffect(() => {
    if (team) {
      setTitle(team.name);
      setShowBackButton(true);
    }
    return () => {
      setTitle(undefined);
      setShowBackButton(false);
    };
  }, [team, setTitle, setShowBackButton]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <p className="text-destructive text-lg font-semibold">
            Команда не найдена
          </p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Команда с указанным ID не существует"}
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/teams")}
            className="mt-4"
          >
            Вернуться к списку команд
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DetailPageNav backHref="/teams" backLabel="Назад к командам" />

      <div className="container mx-auto px-4 py-6 space-y-4 flex-1">
        <TeamProfileComponent
          team={team}
          isEditable={canManage}
          onEdit={() => setEditTeamDialogOpen(true)}
        />

      {/* Players and Tournaments in 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Players List */}
        <Card>
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Игроки команды</CardTitle>
              {canManage && (
                <Button
                  size="sm"
                  onClick={() => setCreatePlayerDialogOpen(true)}
                  className="h-8"
                >
                  Добавить игрока
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-2">
            {playersLoading ? (
              <div className="text-sm text-muted-foreground text-center py-4">
                Загрузка игроков...
              </div>
            ) : players && players.length > 0 ? (
              <div className="overflow-auto rounded-md border">
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-normal">Игрок</TableHead>
                      <TableHead className="font-normal">Позиция</TableHead>
                      <TableHead className="font-normal text-right">Матчи</TableHead>
                      <TableHead className="font-normal text-right">Голы</TableHead>
                      <TableHead className="font-normal text-right">Ассисты</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortPlayersByPosition(players.map(p => ({ ...p, position: p.position as Position[] }))).map((player) => (
                      <TableRow
                        key={player.id}
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => router.push(`/players/${player.id}`)}
                      >
                        <TableCell>
                          <Link
                            href={`/players/${player.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={player.image || undefined}
                                alt={`${player.firstName} ${player.lastName}`}
                              />
                              <AvatarFallback className="bg-muted flex items-center justify-center">
                                <User className="h-4 w-4 text-muted-foreground" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-xs font-medium">
                              {player.firstName} {player.lastName}
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <PositionBadges positions={player.position} />
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {player.totalMatches}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {player.totalGoals}
                        </TableCell>
                        <TableCell className="text-right text-xs">
                          {player.totalAssists}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-4">
                В команде пока нет игроков
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {/* Matches List */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-base font-semibold">Последние матчи</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {matchesLoading ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Загрузка матчей...
                </div>
              ) : matches && matches.length > 0 ? (
                <div className="overflow-auto rounded-md border">
                  <Table className="text-xs">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-normal">Дата</TableHead>
                        <TableHead className="font-normal">Соперник</TableHead>
                        <TableHead className="font-normal text-center">Счет</TableHead>
                        <TableHead className="font-normal">Турнир</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {matches.map((match) => {
                        const isHome = match.homeTeamId === id;
                        const opponentName = isHome ? match.awayTeamName : match.homeTeamName;
                        const opponentLogo = isHome ? match.awayTeamLogo : match.homeTeamLogo;
                        const teamScore = isHome ? match.homeScore : match.awayScore;
                        const opponentScore = isHome ? match.awayScore : match.homeScore;
                        const hasScore = teamScore !== null && opponentScore !== null;
                        const isWin = hasScore && teamScore > opponentScore;
                        const isLoss = hasScore && teamScore < opponentScore;

                        return (
                          <TableRow key={match.id}>
                            <TableCell className="text-xs">
                              {new Date(match.date).toLocaleDateString("ru-RU", {
                                day: "2-digit",
                                month: "2-digit",
                              })}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {opponentLogo ? (
                                  <div className="relative h-6 w-6 flex-shrink-0 rounded overflow-hidden border">
                                    <Image
                                      src={opponentLogo}
                                      alt={opponentName}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-6 w-6 flex-shrink-0 rounded border bg-muted" />
                                )}
                                <div className="text-xs font-medium truncate">
                                  {opponentName}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {hasScore ? (
                                <div className="flex items-center justify-center gap-1">
                                  <span className={isWin ? "font-semibold" : ""}>
                                    {teamScore}
                                  </span>
                                  <span className="text-muted-foreground">:</span>
                                  <span className={isLoss ? "font-semibold" : ""}>
                                    {opponentScore}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground truncate">
                              {match.tournamentName || "—"}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Нет матчей
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tournaments List */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-base font-semibold">Турниры</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {tournamentsLoading ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Загрузка турниров...
                </div>
              ) : tournaments && tournaments.length > 0 ? (
                <div className="space-y-2">
                  {tournaments.map((tournament) => (
                    <Link
                      key={tournament.id}
                      href={`/tournaments/${tournament.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                    >
                      {tournament.logo ? (
                        <div className="relative h-12 w-12 flex-shrink-0 rounded overflow-hidden border">
                          <Image
                            src={tournament.logo}
                            alt={tournament.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 flex-shrink-0 rounded border bg-muted flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{tournament.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {tournament.season && <span>{tournament.season}</span>}
                          {tournament.location && tournament.season && <span> • </span>}
                          {tournament.location && <span>{tournament.location}</span>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Команда пока не участвует в турнирах
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

        {/* Edit Team Dialog */}
        {teamForForm && (
          <TeamForm
            team={teamForForm}
            open={editTeamDialogOpen}
            onOpenChange={setEditTeamDialogOpen}
            onSuccess={() => {
              refetchTeam();
              setEditTeamDialogOpen(false);
            }}
          />
        )}

        {/* Create Player Dialog */}
        <PlayerForm
          player={null}
          open={createPlayerDialogOpen}
          onOpenChange={setCreatePlayerDialogOpen}
          initialTeamId={id}
          onSuccess={() => {
            refetchPlayers();
            setCreatePlayerDialogOpen(false);
          }}
        />
      </div>
    </div>
  );
}

