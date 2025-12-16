"use client";

import { useState, useEffect } from "react";
import { useTournamentsList } from "@/lib/hooks/use-tournaments";
import { TournamentsTable } from "./tournaments-table";
import { TournamentForm } from "./tournament-form";
import { DeleteTournamentDialog } from "./delete-tournament-dialog";
import { Button } from "@/components/ui/button";
import type { Tournament } from "@/lib/types/tournaments";
import { usePageTitle } from "@/components/layout/page-title-context";

interface TournamentsPageClientProps {
  isAdmin: boolean;
}

export function TournamentsPageClient({
  isAdmin,
}: TournamentsPageClientProps) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Турниры");
    return () => setTitle(undefined);
  }, [setTitle]);

  const [page, setPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editTournament, setEditTournament] = useState<Tournament | null>(
    null
  );
  const [deleteTournament, setDeleteTournament] = useState<Tournament | null>(
    null
  );
  const pageSize = 25;

  const { data, isLoading, error, refetch } = useTournamentsList({
    page,
    pageSize,
  });

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-destructive">
          Ошибка загрузки турниров. Попробуйте обновить страницу.
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
            Турниры
          </h1>
          <p className="text-primary-foreground/80 text-lg">Все турниры и соревнования</p>
        </div>
      </section>

      {/* Content */}
      <div className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          {isAdmin && (
            <div className="mb-6 flex justify-end">
              <Button onClick={() => setCreateDialogOpen(true)}>
                Создать турнир
              </Button>
            </div>
          )}
          <div className="flex-1 overflow-auto">
            <TournamentsTable
              data={data?.tournaments || []}
              pagination={
                data?.pagination || {
                  page,
                  pageSize,
                  total: 0,
                  totalPages: 0,
                }
              }
              onPageChange={setPage}
              isLoading={isLoading}
              onEdit={
                isAdmin
                  ? (tournament) => setEditTournament(tournament)
                  : undefined
              }
              onDelete={
                isAdmin
                  ? (tournament) => setDeleteTournament(tournament)
                  : undefined
              }
            />
          </div>
        </div>
      </div>
      {isAdmin && (
        <>
          <TournamentForm
            tournament={null}
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            onSuccess={() => {
              refetch();
            }}
          />
          <TournamentForm
            tournament={editTournament}
            open={!!editTournament}
            onOpenChange={(open) => {
              if (!open) setEditTournament(null);
            }}
            onSuccess={() => {
              refetch();
              setEditTournament(null);
            }}
          />
          <DeleteTournamentDialog
            tournament={deleteTournament}
            open={!!deleteTournament}
            onOpenChange={(open) => {
              if (!open) setDeleteTournament(null);
            }}
            onSuccess={() => {
              refetch();
              setDeleteTournament(null);
            }}
          />
        </>
      )}
    </div>
  );
}

