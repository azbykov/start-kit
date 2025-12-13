"use client";

import { use, useEffect } from "react";
import { usePlayerProfile, usePlayerMatchStats } from "@/lib/hooks/use-players";
import { PlayerMatchStatsTables } from "@/components/players/player-match-stats-tables";
import { FootballTimelineD3 } from "@/components/matches/football-timeline-d3";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { usePageTitle } from "@/components/layout/page-title-context";
import { ArrowLeft, Calendar, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { TeamLink } from "@/components/teams/team-link";

interface PlayerMatchStatsPageProps {
  params: Promise<{ id: string; matchId: string }>;
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default function PlayerMatchStatsPage({
  params,
}: PlayerMatchStatsPageProps) {
  const router = useRouter();
  const { id, matchId } = use(params);
  const { data: player, isLoading: playerLoading } = usePlayerProfile(id);
  const { data: stats, isLoading: statsLoading, error } = usePlayerMatchStats(
    id,
    matchId
  );
  const { setMetaData, setShowBackButton } = usePageTitle();

  // Update header with player info
  useEffect(() => {
    if (player) {
      setMetaData({
        firstName: player.firstName,
        lastName: player.lastName,
        teamId: player.teamId,
        team: player.team,
        image: player.image,
      });
      setShowBackButton(true);
    }
    return () => {
      setMetaData(undefined);
      setShowBackButton(false);
    };
  }, [player, setMetaData, setShowBackButton]);

  if (playerLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  if (error || !stats || !player) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <p className="text-destructive text-lg font-semibold">
            {error instanceof Error
              ? error.message
              : "Статистика не найдена"}
          </p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Статистика для этого матча недоступна"}
          </p>
          <Button
            variant="outline"
            onClick={() => router.push(`/players/${id}`)}
            className="mt-4"
          >
            Вернуться к профилю игрока
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Match Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">
              Статистика за матч
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Match Info */}
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex items-center justify-center gap-6 w-full">
                <div className="flex items-center gap-3">
                  <Link
                    href={`/teams/${stats.match.homeTeam.id}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    {stats.match.homeTeam.logo ? (
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden border">
                        <Image
                          src={stats.match.homeTeam.logo}
                          alt={stats.match.homeTeam.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-lg border bg-muted flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {stats.match.homeTeam.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-lg font-semibold">
                      {stats.match.homeTeam.name}
                    </span>
                  </Link>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="text-2xl font-bold">
                    {stats.match.homeScore !== null &&
                    stats.match.awayScore !== null ? (
                      <>
                        {stats.match.homeScore} : {stats.match.awayScore}
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/teams/${stats.match.awayTeam.id}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <span className="text-lg font-semibold">
                      {stats.match.awayTeam.name}
                    </span>
                    {stats.match.awayTeam.logo ? (
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden border">
                        <Image
                          src={stats.match.awayTeam.logo}
                          alt={stats.match.awayTeam.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-lg border bg-muted flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {stats.match.awayTeam.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </Link>
                </div>
              </div>
            </div>

            {/* Match Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Дата: </span>
                <span className="font-medium">
                  {formatDate(stats.match.date)}
                </span>
              </div>
              {stats.match.time && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Время: </span>
                  <span className="font-medium">{stats.match.time}</span>
                </div>
              )}
              {stats.match.stadium && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Стадион: </span>
                  <span className="font-medium">{stats.match.stadium}</span>
                </div>
              )}
              {stats.match.tournament && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Турнир: </span>
                  <Link
                    href={`/tournaments/${stats.match.tournament.id}`}
                    className="font-medium hover:underline"
                  >
                    {stats.match.tournament.name}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player Basic Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Статистика игрока
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Голы: </span>
              <span className="font-semibold">{stats.playerStats.goals}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Ассисты: </span>
              <span className="font-semibold">{stats.playerStats.assists}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Минуты: </span>
              <span className="font-semibold">
                {stats.playerStats.minutesPlayed}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Команда: </span>
              <TeamLink team={stats.team} size="sm" />
            </div>
            {stats.playerStats.yellowCards > 0 && (
              <div>
                <span className="text-muted-foreground">Желтые карточки: </span>
                <span className="font-semibold text-yellow-600">
                  {stats.playerStats.yellowCards}
                </span>
              </div>
            )}
            {stats.playerStats.redCards > 0 && (
              <div>
                <span className="text-muted-foreground">Красные карточки: </span>
                <span className="font-semibold text-red-600">
                  {stats.playerStats.redCards}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">Таймлайн событий</CardTitle>
        </CardHeader>
        <CardContent>
          <FootballTimelineD3
            events={stats.events}
            homeTeamId={stats.match.homeTeam.id}
            awayTeamId={stats.match.awayTeam.id}
            width={1200}
            height={300}
            className="w-full"
            filterByPlayerId={id}
            playerTeamId={stats.team.id}
          />
        </CardContent>
      </Card>

      {/* Detailed Statistics Tables */}
      <PlayerMatchStatsTables data={stats} />
    </div>
  );
}
