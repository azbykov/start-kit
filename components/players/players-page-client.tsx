"use client";

import { useState, useEffect } from "react";
import { usePlayersList } from "@/lib/hooks/use-players";
import { PlayersTable } from "./players-table";
import { PlayerForm } from "./player-form";
import { DeletePlayerDialog } from "./delete-player-dialog";
import { Button } from "@/components/ui/button";
import type { Player } from "@/lib/types/players";
import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { usePageTitle } from "@/components/layout/page-title-context";

interface PlayersPageClientProps {
  isAdmin: boolean;
}

export function PlayersPageClient({ isAdmin }: PlayersPageClientProps) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Игроки");
    return () => setTitle(undefined);
  }, [setTitle]);

  const [page, setPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editPlayer, setEditPlayer] = useState<Player | null>(null);
  const [deletePlayer, setDeletePlayer] = useState<Player | null>(null);
  const pageSize = 25;

  const { data, isLoading, error, refetch } = usePlayersList({ page, pageSize });

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-destructive">
          Ошибка загрузки игроков. Попробуйте обновить страницу.
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
            Игроки
          </h1>
          <p className="text-primary-foreground/80 text-lg">База данных игроков</p>
        </div>
      </section>

      {/* Content */}
      <div className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8">
          {isAdmin && (
            <div className="mb-6 flex justify-end">
              <Button onClick={() => setCreateDialogOpen(true)}>
                Создать игрока
              </Button>
            </div>
          )}
          <div className="flex-1 overflow-auto">
            <PlayersTable
              data={data?.players || []}
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
              onEdit={isAdmin ? (player) => setEditPlayer(player) : undefined}
              onDelete={isAdmin ? (player) => setDeletePlayer(player) : undefined}
            />
          </div>
        </div>
      </div>
      {isAdmin && (
        <>
          <PlayerForm
            player={null}
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            onSuccess={() => {
              refetch();
            }}
          />
          <PlayerForm
            player={editPlayer}
            open={!!editPlayer}
            onOpenChange={(open) => {
              if (!open) setEditPlayer(null);
            }}
            onSuccess={() => {
              refetch();
              setEditPlayer(null);
            }}
          />
          <DeletePlayerDialog
            player={deletePlayer}
            open={!!deletePlayer}
            onOpenChange={(open) => {
              if (!open) setDeletePlayer(null);
            }}
            onSuccess={() => {
              refetch();
              setDeletePlayer(null);
            }}
          />
        </>
      )}
    </div>
  );
}



