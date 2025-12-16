"use client";

import { useState, useEffect } from "react";
import { useTeamsList } from "@/lib/hooks/use-teams";
import { TeamsTable } from "./teams-table";
import { TeamForm } from "./team-form";
import { DeleteTeamDialog } from "./delete-team-dialog";
import { Button } from "@/components/ui/button";
import type { Team } from "@/lib/types/teams";
import { usePageTitle } from "@/components/layout/page-title-context";

interface TeamsPageClientProps {
  isAdmin: boolean;
}

export function TeamsPageClient({ isAdmin }: TeamsPageClientProps) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Команды");
    return () => setTitle(undefined);
  }, [setTitle]);

  const [page, setPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editTeam, setEditTeam] = useState<Team | null>(null);
  const [deleteTeam, setDeleteTeam] = useState<Team | null>(null);
  const pageSize = 25;

  const { data, isLoading, error, refetch } = useTeamsList({
    page,
    pageSize,
  });

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-destructive">
          Ошибка загрузки команд. Попробуйте обновить страницу.
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
            Команды
          </h1>
          <p className="text-primary-foreground/80 text-lg">Все команды и статистика</p>
        </div>
      </section>

      {/* Content */}
      <div className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          {isAdmin && (
            <div className="mb-6 flex justify-end">
              <Button onClick={() => setCreateDialogOpen(true)}>
                Создать команду
              </Button>
            </div>
          )}
          <div className="flex-1 overflow-auto">
            <TeamsTable
              data={data?.teams || []}
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
              onEdit={isAdmin ? (team) => setEditTeam(team) : undefined}
              onDelete={isAdmin ? (team) => setDeleteTeam(team) : undefined}
            />
          </div>
        </div>
      </div>
      {isAdmin && (
        <>
          <TeamForm
            team={null}
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            onSuccess={() => {
              refetch();
            }}
          />
          <TeamForm
            team={editTeam}
            open={!!editTeam}
            onOpenChange={(open) => {
              if (!open) setEditTeam(null);
            }}
            onSuccess={() => {
              refetch();
              setEditTeam(null);
            }}
          />
          <DeleteTeamDialog
            team={deleteTeam}
            open={!!deleteTeam}
            onOpenChange={(open) => {
              if (!open) setDeleteTeam(null);
            }}
            onSuccess={() => {
              refetch();
              setDeleteTeam(null);
            }}
          />
        </>
      )}
    </div>
  );
}

