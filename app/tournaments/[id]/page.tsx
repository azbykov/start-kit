"use client";

import { use, useEffect, useState } from "react";
import {
  useTournamentProfile,
  useTournamentStandings,
  useTournamentMatches,
  useTournamentStatistics,
  useTournamentTeams,
  useTournamentTeamStatistics,
  useTournamentDocuments,
} from "@/lib/hooks/use-tournaments";
import { TournamentProfileComponent } from "@/components/tournaments/tournament-profile";
import { TournamentStandings } from "@/components/tournaments/tournament-standings";
import { TournamentStatistics } from "@/components/tournaments/tournament-statistics";
import { TournamentTeamStatistics } from "@/components/tournaments/tournament-team-statistics";
import { TournamentDocuments } from "@/components/tournaments/tournament-documents";
import { TournamentMatchAddDialog } from "@/components/tournaments/tournament-match-add-dialog";
import { TournamentTeamAddDialog } from "@/components/tournaments/tournament-team-add-dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { usePageTitle } from "@/components/layout/page-title-context";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { DetailPageNav } from "@/components/layout/detail-page-nav";

interface TournamentProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function TournamentProfilePage({
  params,
}: TournamentProfilePageProps) {
  const router = useRouter();
  const { id } = use(params);
  const { data: tournament, isLoading, error } = useTournamentProfile(id);
  const { data: standings, isLoading: standingsLoading } = useTournamentStandings(id);
  const { data: matches, isLoading: matchesLoading } = useTournamentMatches(id);
  const { data: statistics, isLoading: statisticsLoading } = useTournamentStatistics(id);
  const { data: teamStatistics, isLoading: teamStatisticsLoading } =
    useTournamentTeamStatistics(id);
  const { data: documents, isLoading: documentsLoading } =
    useTournamentDocuments(id);
  const { data: teams } = useTournamentTeams(id);
  const { setTitle, setShowBackButton } = usePageTitle();
  const { data: session } = useSession();
  
  const isAdmin = session?.user?.role === Role.ADMIN;
  const [addMatchOpen, setAddMatchOpen] = useState(false);
  const [addTeamOpen, setAddTeamOpen] = useState(false);

  // Update header with tournament info
  useEffect(() => {
    if (tournament) {
      setTitle(tournament.name);
      setShowBackButton(true);
    }
    return () => {
      setTitle(undefined);
      setShowBackButton(false);
    };
  }, [tournament, setTitle, setShowBackButton]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-2">
          <p className="text-destructive text-lg font-semibold">
            Турнир не найден
          </p>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error
              ? error.message
              : "Турнир с указанным ID не существует"}
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/tournaments")}
            className="mt-4"
          >
            Вернуться к списку турниров
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Tabs defaultValue="standings" className="flex-grow flex flex-col">
        <DetailPageNav
          backHref="/tournaments"
          backLabel="Назад к турнирам"
          tabs={[
            { value: "standings", label: "Таблица" },
            { value: "statistics", label: "Статистика" },
          ]}
        />

        <div className="container mx-auto px-4 py-6 space-y-4 flex-1">
          <TournamentProfileComponent
            tournament={tournament}
            isAdmin={isAdmin}
            onEdit={() => {
              // TODO: Open edit tournament dialog
              console.log("Edit tournament");
            }}
            onAddMatch={() => setAddMatchOpen(true)}
            onAddTeam={() => setAddTeamOpen(true)}
          />

          <TournamentDocuments
            tournamentId={id}
            documents={documents || []}
            isLoading={documentsLoading}
            isAdmin={isAdmin}
          />
        
          <TabsContent value="standings" className="mt-0 space-y-4">
            <TournamentStandings
              standings={standings || []}
              matches={matches || []}
              isLoading={standingsLoading || matchesLoading}
              isAdmin={isAdmin}
            />
          </TabsContent>
        
          <TabsContent value="statistics" className="mt-0">
            <div className="space-y-4">
              <TournamentTeamStatistics
                teams={teamStatistics || []}
                isLoading={teamStatisticsLoading}
              />
            <TournamentStatistics
              statistics={statistics || []}
              isLoading={statisticsLoading}
            />
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {isAdmin && teams && (
        <>
          <TournamentMatchAddDialog
            tournamentId={id}
            teams={teams}
            open={addMatchOpen}
            onOpenChange={setAddMatchOpen}
            onSuccess={() => {
              // Invalidate queries to refresh data
              // The hooks will automatically refetch
            }}
          />
          <TournamentTeamAddDialog
            tournamentId={id}
            currentTeamIds={teams.map((t) => t.id)}
            open={addTeamOpen}
            onOpenChange={setAddTeamOpen}
            onSuccess={() => {
              // Invalidate queries to refresh data
              // The hooks will automatically refetch
            }}
          />
        </>
      )}
    </div>
  );
}

