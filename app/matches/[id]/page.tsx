"use client";

import { use, useEffect, useState } from "react";
import { useMatchProfile, useMatchPlayers, useMatchEvents } from "@/lib/hooks/use-matches";
import { MatchProfileComponent } from "@/components/matches/match-profile";
import { MatchPlayers } from "@/components/matches/match-players";
import { MatchTimeline } from "@/components/matches/match-timeline";
import { MatchStats } from "@/components/matches/match-stats";
import { MatchVideos } from "@/components/matches/match-videos";
import { MatchEditDialog } from "@/components/matches/match-edit-dialog";
import { MatchPlayerEditDialog } from "@/components/matches/match-player-edit-dialog";
import { MatchPlayerDeleteDialog } from "@/components/matches/match-player-delete-dialog";
import { MatchEventAddDialog } from "@/components/matches/match-event-add-dialog";
import { MatchPlayerAddDialog } from "@/components/matches/match-player-add-dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { usePageTitle } from "@/components/layout/page-title-context";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { MatchPlayer } from "@/lib/types/matches";
import { DetailPageNav } from "@/components/layout/detail-page-nav";

interface MatchProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function MatchProfilePage({
  params,
}: MatchProfilePageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { data: match, isLoading, error, refetch: refetchMatch } = useMatchProfile(id);
  const { data: players, isLoading: playersLoading, refetch: refetchPlayers } = useMatchPlayers(id);
  const { data: eventsData, isLoading: eventsLoading, refetch: refetchEvents } = useMatchEvents(id);
  const { setTitle, setShowBackButton } = usePageTitle();
  const { data: session } = useSession();

  const isAdmin = session?.user?.role === Role.ADMIN;
  const [editMatchOpen, setEditMatchOpen] = useState(false);
  const [editPlayer, setEditPlayer] = useState<MatchPlayer | null>(null);
  const [deletePlayer, setDeletePlayer] = useState<MatchPlayer | null>(null);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [addPlayerTeam, setAddPlayerTeam] = useState<{ teamId: string; teamName: string } | null>(null);

  // Update header with match info
  useEffect(() => {
    if (match) {
      setTitle(`${match.homeTeam.name} — ${match.awayTeam.name}`);
      setShowBackButton(true);
    }
    return () => {
      setTitle(undefined);
      setShowBackButton(false);
    };
  }, [match, setTitle, setShowBackButton]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <p className="text-destructive text-lg font-semibold">
            Матч не найден
          </p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Матч с указанным ID не существует"}
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/matches")}
            className="mt-4"
          >
            Вернуться к списку матчей
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Tabs defaultValue="events" className="flex-grow flex flex-col">
        <DetailPageNav
          backHref="/matches"
          backLabel="Назад к матчам"
          tabsListClassName="flex-wrap h-auto"
          tabs={[
            { value: "events", label: "Хронология" },
            { value: "stats", label: "Статистика" },
            { value: "players", label: "Составы" },
            { value: "videos", label: "Видео" },
          ]}
        />

        <div className="container mx-auto px-4 py-6 space-y-4 flex-1">
          <MatchProfileComponent
            match={match}
            players={players || undefined}
            isAdmin={isAdmin}
            onEdit={() => setEditMatchOpen(true)}
          />

        {/* Events Timeline */}
          <TabsContent value="events" className="mt-0">
          {eventsLoading ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              Загрузка событий...
            </div>
          ) : eventsData?.events ? (
            <MatchTimeline
              events={eventsData.events}
              homeTeamId={match.homeTeam.id}
              awayTeamId={match.awayTeam.id}
              isAdmin={isAdmin}
              onAddEvent={() => setAddEventOpen(true)}
            />
          ) : (
            <MatchTimeline
              events={[]}
              homeTeamId={match.homeTeam.id}
              awayTeamId={match.awayTeam.id}
              isAdmin={isAdmin}
              onAddEvent={() => setAddEventOpen(true)}
            />
          )}
          </TabsContent>

        {/* Statistics */}
          <TabsContent value="stats" className="mt-0">
          {playersLoading ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              Загрузка статистики...
            </div>
          ) : players ? (
            <MatchStats players={players} />
          ) : null}
          </TabsContent>

        {/* Lineups */}
          <TabsContent value="players" className="mt-0">
          {playersLoading ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              Загрузка составов...
            </div>
          ) : players ? (
            <MatchPlayers
              players={players}
              isAdmin={isAdmin}
              matchId={id}
              onEditPlayer={(player) => setEditPlayer(player)}
              onDeletePlayer={(player) => setDeletePlayer(player)}
              onAddPlayer={(teamId, teamName) => {
                setAddPlayerTeam({ teamId, teamName });
                setAddPlayerOpen(true);
              }}
            />
          ) : null}
          </TabsContent>

          <TabsContent value="videos" className="mt-0">
            <MatchVideos videoLinks={[]} />
          </TabsContent>
        </div>
      </Tabs>

      {isAdmin && (
        <>
          <MatchEditDialog
            match={match}
            open={editMatchOpen}
            onOpenChange={setEditMatchOpen}
            onSuccess={() => {
              refetchMatch();
              refetchPlayers();
            }}
          />
          {editPlayer && (
            <MatchPlayerEditDialog
              matchId={id}
              player={editPlayer}
              open={!!editPlayer}
              onOpenChange={(open) => {
                if (!open) setEditPlayer(null);
              }}
              onSuccess={() => {
                refetchPlayers();
                setEditPlayer(null);
              }}
            />
          )}
          {deletePlayer && (
            <MatchPlayerDeleteDialog
              matchId={id}
              player={deletePlayer}
              open={!!deletePlayer}
              onOpenChange={(open) => {
                if (!open) setDeletePlayer(null);
              }}
              onSuccess={() => {
                refetchPlayers();
                setDeletePlayer(null);
              }}
            />
          )}
          <MatchEventAddDialog
            matchId={id}
            homeTeamId={match.homeTeam.id}
            awayTeamId={match.awayTeam.id}
            open={addEventOpen}
            onOpenChange={setAddEventOpen}
            onSuccess={() => {
              refetchEvents();
            }}
          />
          {addPlayerTeam && (
            <MatchPlayerAddDialog
              matchId={id}
              teamId={addPlayerTeam.teamId}
              teamName={addPlayerTeam.teamName}
              open={addPlayerOpen}
              onOpenChange={(open) => {
                if (!open) {
                  setAddPlayerOpen(false);
                  setAddPlayerTeam(null);
                }
              }}
              onSuccess={() => {
                refetchPlayers();
                setAddPlayerOpen(false);
                setAddPlayerTeam(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

