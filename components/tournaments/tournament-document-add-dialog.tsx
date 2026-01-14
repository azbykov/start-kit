"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUploadTournamentDocument } from "@/lib/hooks/use-admin-tournaments";

interface TournamentDocumentAddDialogProps {
  tournamentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TournamentDocumentAddDialog({
  tournamentId,
  open,
  onOpenChange,
  onSuccess,
}: TournamentDocumentAddDialogProps) {
  const uploadMutation = useUploadTournamentDocument();
  const [title, setTitle] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    if (!open) {
      setTitle("");
      setFile(null);
    }
  }, [open]);

  const isLoading = uploadMutation.isPending;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    await uploadMutation.mutateAsync({
      tournamentId,
      title: title.trim().length > 0 ? title.trim() : undefined,
      file,
    });

    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Добавить документ</DialogTitle>
          <DialogDescription>
            Загрузите файл и укажите название (опционально).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Регламент"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">
              Файл <span className="text-destructive">*</span>
            </Label>
            <Input
              id="file"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              disabled={isLoading}
            />
            {!file && (
              <p className="text-xs text-muted-foreground">
                Только PDF/DOC/DOCX, максимум 10 МБ. Не более 5 документов на турнир.
              </p>
            )}
          </div>

          {uploadMutation.error && (
            <div className="text-sm text-destructive">
              {uploadMutation.error instanceof Error
                ? uploadMutation.error.message
                : "Ошибка при загрузке документа"}
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
            <Button type="submit" disabled={isLoading || !file}>
              {isLoading ? "Загрузка..." : "Загрузить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

