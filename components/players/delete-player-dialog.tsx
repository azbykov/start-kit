"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeletePlayer } from "@/lib/hooks/use-admin-players";
import type { Player } from "@/lib/types/players";

interface DeletePlayerDialogProps {
  player: Player | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeletePlayerDialog({
  player,
  open,
  onOpenChange,
  onSuccess,
}: DeletePlayerDialogProps) {
  const deleteMutation = useDeletePlayer();

  const handleDelete = async () => {
    if (!player) return;

    try {
      await deleteMutation.mutateAsync(player.id);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // Error handling is done by mutation - error is displayed in UI
    }
  };

  const isLoading = deleteMutation.isPending;
  const error = deleteMutation.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Удалить игрока</DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите удалить игрока{" "}
            <strong>
              {player?.firstName} {player?.lastName}
            </strong>
            ? Это действие нельзя отменить.
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



