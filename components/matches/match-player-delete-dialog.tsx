"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MatchPlayer } from "@/lib/types/matches";
import { useDeleteMatchPlayer } from "@/lib/hooks/use-admin-matches";

interface MatchPlayerDeleteDialogProps {
  matchId: string;
  player: MatchPlayer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MatchPlayerDeleteDialog({
  matchId,
  player,
  open,
  onOpenChange,
  onSuccess,
}: MatchPlayerDeleteDialogProps) {
  const deleteMutation = useDeleteMatchPlayer();

  const handleDelete = async () => {
    if (!player) return;

    try {
      await deleteMutation.mutateAsync({
        matchId,
        playerId: player.playerId,
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // Error handling is done by mutation
      console.error("Delete error:", error);
    }
  };

  const isLoading = deleteMutation.isPending;
  const error = deleteMutation.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Удалить игрока из матча</DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите удалить игрока{" "}
            <strong>{player?.playerName}</strong> из матча? Это действие нельзя отменить.
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="rounded-md bg-destructive/10 p-3">
            <p className="text-sm text-destructive">
              {error instanceof Error
                ? error.message
                : "Произошла ошибка. Попробуйте еще раз."}
            </p>
          </div>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Удаление..." : "Удалить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

