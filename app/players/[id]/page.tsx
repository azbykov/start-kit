"use client";

import { use, useEffect } from "react";
import { usePlayerProfile, usePlayerMatches, usePlayerEvents } from "@/lib/hooks/use-players";
import { PlayerProfileComponent } from "@/components/players/player-profile";
import { PlayerStats } from "@/components/players/player-stats";
import { PlayerVideos } from "@/components/players/player-videos";
import { PlayerMatches } from "@/components/players/player-matches";
import { PlayerEventsStatistics } from "@/components/players/player-events-statistics";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, usePathname } from "next/navigation";
import { usePageTitle } from "@/components/layout/page-title-context";

interface PlayerProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { id } = use(params);
  const { data: player, isLoading, error } = usePlayerProfile(id);
  const { data: matches, isLoading: matchesLoading } = usePlayerMatches(id);
  const { data: events, isLoading: eventsLoading } = usePlayerEvents(id);
  const { setMetaData } = usePageTitle();

  // Determine active tab from URL
  const isStatsPage = pathname === `/players/${id}/stats`;
  const activeTab = isStatsPage ? "statistics" : "general";

  // Handle tab change with URL update
  const handleTabChange = (value: string) => {
    if (value === "statistics") {
      router.push(`/players/${id}/stats`);
    } else {
      router.push(`/players/${id}`);
    }
  };

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
    }
    return () => {
      setMetaData(undefined);
    };
  }, [player, setMetaData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <p className="text-destructive text-lg font-semibold">
            Игрок не найден
          </p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Игрок с указанным ID не существует"}
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/players")}
            className="mt-4"
          >
            Вернуться к списку игроков
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabs: General and Statistics - at the top */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList>
          <TabsTrigger value="general">Общее</TabsTrigger>
          <TabsTrigger value="statistics">Статистика</TabsTrigger>
        </TabsList>

        {/* Tab content for General */}
        <TabsContent value="general" className="space-y-4 mt-1">
      {/* Top row: General Info (left) and Player Stats (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PlayerProfileComponent player={player} />
        <PlayerStats statistics={player.statistics} />
      </div>

          {/* Bottom row: Videos (left) and Matches (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PlayerVideos videoLinks={player.videoLinks} />
            {matchesLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">Загрузка матчей...</div>
              </div>
            ) : matches ? (
              <PlayerMatches data={matches} playerId={player.id} />
            ) : null}
          </div>
        </TabsContent>

        {/* Tab content for Statistics */}
        <TabsContent value="statistics" className="space-y-4 mt-1">
          {/* Statistics content only - no General Info */}
          {eventsLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-muted-foreground">Загрузка статистики...</div>
      </div>
          ) : events ? (
            <PlayerEventsStatistics data={events} />
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
