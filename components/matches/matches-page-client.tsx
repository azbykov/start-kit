"use client";

import { useState, useEffect } from "react";
import { useMatchesList } from "@/lib/hooks/use-matches";
import { MatchesTable } from "./matches-table";
import { MatchForm } from "./match-form";
import { DeleteMatchDialog } from "./delete-match-dialog";
import { Button } from "@/components/ui/button";
import type { Match } from "@/lib/types/matches";
import { usePageTitle } from "@/components/layout/page-title-context";

interface MatchesPageClientProps {
  isAdmin: boolean;
}

export function MatchesPageClient({
  isAdmin,
}: MatchesPageClientProps) {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Матчи");
    return () => setTitle(undefined);
  }, [setTitle]);

  const [page, setPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editMatch, setEditMatch] = useState<Match | null>(null);
  const [deleteMatch, setDeleteMatch] = useState<Match | null>(null);
  const pageSize = 25;

  const { data, isLoading, error, refetch } = useMatchesList({
    page,
    pageSize,
  });

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
    <div className="flex h-full flex-col">
      {isAdmin && (
        <div className="mb-2 flex justify-end">
          <Button onClick={() => setCreateDialogOpen(true)}>
            Создать матч
          </Button>
        </div>
      )}
      <div className="flex-1 overflow-auto">
        <MatchesTable
          data={data?.matches || []}
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
              ? (match) => setEditMatch(match)
              : undefined
          }
          onDelete={
            isAdmin
              ? (match) => setDeleteMatch(match)
              : undefined
          }
        />
      </div>
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











