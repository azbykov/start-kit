"use client";

import { useState, useEffect, useMemo } from "react";
import { useMatchesList } from "@/lib/hooks/use-matches";
import { useAllTournaments } from "@/lib/hooks/use-tournaments";
import { MatchCard } from "./match-card";
import { MatchForm } from "./match-form";
import { DeleteMatchDialog } from "./delete-match-dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Users } from "lucide-react";
import type { Match } from "@/lib/types/matches";
import { usePageTitle } from "@/components/layout/page-title-context";

interface MatchesPageClientProps {
  isAdmin: boolean;
}

export function MatchesPageClient({ isAdmin }: MatchesPageClientProps) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Матчи");
    return () => setTitle(undefined);
  }, [setTitle]);

  const [page, setPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editMatch, setEditMatch] = useState<Match | null>(null);
  const [deleteMatch, setDeleteMatch] = useState<Match | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const pageSize = 50;

  const { data, isLoading, error, refetch } = useMatchesList({
    page,
    pageSize,
    tournamentId: selectedTournament !== "all" ? selectedTournament : undefined,
    status: selectedStatus !== "all" ? selectedStatus : undefined,
  });

  const { data: tournaments } = useAllTournaments();

  // Filter matches client-side for better UX
  const filteredMatches = useMemo(() => {
    if (!data?.matches) return [];
    let matches = data.matches;

    // Tournament filter
    if (selectedTournament !== "all") {
      matches = matches.filter((m) => m.tournamentId === selectedTournament);
    }

    // Status filter
    if (selectedStatus !== "all") {
      matches = matches.filter((m) => m.status === selectedStatus);
    }

    return matches;
  }, [data?.matches, selectedTournament, selectedStatus]);

  const statusOptions = [
    { value: "all", label: "Все матчи" },
    { value: "FINISHED", label: "Завершённые" },
    { value: "LIVE", label: "Live" },
    { value: "SCHEDULED", label: "Предстоящие" },
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-destructive">
          Ошибка загрузки матчей. Попробуйте обновить страницу.
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Page Header */}
      <section className="py-12 lg:py-16 gradient-hero">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl lg:text-4xl font-display font-bold text-primary-foreground mb-2">
            Матчи и результаты
          </h1>
          <p className="text-primary-foreground/80 text-lg">Все матчи и статистика</p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Filter className="w-5 h-5" />
              <span className="font-medium">Фильтры:</span>
            </div>

            <Select value={selectedTournament} onValueChange={setSelectedTournament}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Турнир" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все турниры</SelectItem>
                {tournaments?.map((tournament) => (
                  <SelectItem key={tournament.id} value={tournament.id}>
                    {tournament.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>Найдено: {filteredMatches.length} матчей</span>
            </div>

            {isAdmin && (
              <Button onClick={() => setCreateDialogOpen(true)}>Создать матч</Button>
            )}
          </div>
        </div>
      </section>

      {/* Matches Grid */}
      <section className="py-8 lg:py-12 bg-background">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Загрузка...</div>
            </div>
          ) : filteredMatches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMatches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Матчи не найдены</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSelectedTournament("all");
                  setSelectedStatus("all");
                }}
              >
                Сбросить фильтры
              </Button>
            </div>
          )}
        </div>
      </section>

      {isAdmin && (
        <>
          <MatchForm
            match={null}
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            onSuccess={() => {
              refetch();
            }}
          />
          <MatchForm
            match={editMatch}
            open={!!editMatch}
            onOpenChange={(open) => {
              if (!open) setEditMatch(null);
            }}
            onSuccess={() => {
              refetch();
              setEditMatch(null);
            }}
          />
          <DeleteMatchDialog
            match={deleteMatch}
            open={!!deleteMatch}
            onOpenChange={(open) => {
              if (!open) setDeleteMatch(null);
            }}
            onSuccess={() => {
              refetch();
              setDeleteMatch(null);
            }}
          />
        </>
      )}
    </div>
  );
}













