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
    <div className="flex h-full flex-col">
      {isAdmin && (
        <div className="mb-2 flex justify-end">
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



