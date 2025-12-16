"use client";

import { use, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { usePlayerProfile, usePlayerMatches } from "@/lib/hooks/use-players";
import { PlayerProfileComponent } from "@/components/players/player-profile";
import { PlayerStats } from "@/components/players/player-stats";
import { PlayerVideos } from "@/components/players/player-videos";
import { PlayerMatches } from "@/components/players/player-matches";
import { SummaryStatsTable } from "@/components/players/player-summary-stats";
import { PassesBlock } from "@/components/players/player-passes-block";
import { ShotsBlock } from "@/components/players/player-shots-block";
import { ChallengesBlock } from "@/components/players/player-challenges-block";
import { FinishingBlock } from "@/components/players/player-finishing-block";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { usePageTitle } from "@/components/layout/page-title-context";
import { DetailPageNav } from "@/components/layout/detail-page-nav";

interface PlayerProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { id } = use(params);
  const { data: player, isLoading, error } = usePlayerProfile(id);
  const { data: matches, isLoading: matchesLoading } = usePlayerMatches(id);
  const { setMetaData } = usePageTitle();

  // Determine active tab from URL
  const isStatsPage = pathname === `/players/${id}/stats`;
  const isMatchesPage = pathname === `/players/${id}/matches`;
  const activeTab = isStatsPage ? "stats" : isMatchesPage ? "matches" : "overview";

  // Handle tab change with URL update
  const handleTabChange = (value: string) => {
    if (value === "stats") {
      router.push(`/players/${id}/stats`);
    } else if (value === "matches") {
      router.push(`/players/${id}/matches`);
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
          <p className="text-destructive text-lg font-semibold">Игрок не найден</p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Игрок с указанным ID не существует"}
          </p>
          <Button variant="outline" onClick={() => router.push("/players")} className="mt-4">
            Вернуться к списку игроков
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-grow flex flex-col">
        {/* Back Navigation + Tabs */}
        <DetailPageNav
          backHref="/players"
          backLabel="Назад к игрокам"
          tabs={[
            { value: "overview", label: "Обзор" },
            { value: "stats", label: "Статистика" },
            { value: "matches", label: "Матчи" },
          ]}
        />

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 flex-1">
          <TabsContent value="overview" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* General Info */}
              <PlayerProfileComponent player={player} />
              {/* Player Stats */}
              <PlayerStats statistics={player.statistics} />
            </div>

            {/* Videos and Matches - Two columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Videos */}
              <PlayerVideos videoLinks={player.videoLinks} />

              {/* Recent Matches */}
              {matchesLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-muted-foreground">Загрузка матчей...</div>
                </div>
              ) : matches ? (
                <PlayerMatches data={matches} playerId={player.id} />
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6 mt-0">
            {/* Summary Stats Table */}
            <SummaryStatsTable statistics={player.statistics} />

            {/* Passes Block */}
            <PassesBlock />

            {/* Shots Block */}
            <ShotsBlock />

            {/* Challenges Block */}
            <ChallengesBlock />

            {/* Finishing Block */}
            <FinishingBlock />
          </TabsContent>

          <TabsContent value="matches" className="space-y-6 mt-0">
            {matchesLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">Загрузка матчей...</div>
              </div>
            ) : matches ? (
              <PlayerMatches data={matches} playerId={player.id} />
            ) : (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center">
                    <p className="text-muted-foreground">Матчи не найдены</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
