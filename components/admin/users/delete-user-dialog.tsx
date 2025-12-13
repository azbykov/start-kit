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
import { useDeleteUser } from "@/lib/hooks/use-admin-users";
import type { User } from "@/lib/types/admin-users";

interface DeleteUserDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteUserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: DeleteUserDialogProps) {
  const deleteMutation = useDeleteUser();

  const handleDelete = async () => {
    if (!user) return;

    try {
      await deleteMutation.mutateAsync(user.id);
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
          <DialogTitle>Удалить пользователя</DialogTitle>
          <DialogDescription>
            Вы уверены, что хотите удалить пользователя{" "}
            <strong>{user?.name || user?.email}</strong>? Это действие нельзя
            отменить.
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

