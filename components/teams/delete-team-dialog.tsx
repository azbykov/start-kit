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
import type { Team } from "@/lib/types/teams";
import { useDeleteTeam } from "@/lib/hooks/use-admin-teams";

interface DeleteTeamDialogProps {
  team: Team | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteTeamDialog({
  team,
  open,
  onOpenChange,
  onSuccess,
}: DeleteTeamDialogProps) {
  const deleteMutation = useDeleteTeam();

  const handleDelete = async () => {
    if (!team) return;

    try {
      await deleteMutation.mutateAsync(team.id);
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
          <DialogTitle>Удалить команду</DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите удалить команду{" "}
            <strong>{team?.name}</strong>? Это действие нельзя отменить.
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

