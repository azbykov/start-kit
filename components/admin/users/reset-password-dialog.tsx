"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResetUserPassword } from "@/lib/hooks/use-admin-users";
import type { User } from "@/lib/types/admin-users";
import { Copy, Check } from "lucide-react";

interface ResetPasswordDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ResetPasswordDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: ResetPasswordDialogProps) {
  const resetPasswordMutation = useResetUserPassword();
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleReset = async () => {
    if (!user) return;

    try {
      const result = await resetPasswordMutation.mutateAsync(user.id);
      setNewPassword(result.newPassword);
      onSuccess?.();
    } catch (error) {
      // Error handling is done by mutation
      console.error("Reset password error:", error);
    }
  };

  const handleCopy = async () => {
    if (newPassword) {
      await navigator.clipboard.writeText(newPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setNewPassword(null);
    setCopied(false);
    onOpenChange(false);
  };

  const isLoading = resetPasswordMutation.isPending;
  const error = resetPasswordMutation.error;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Сбросить пароль</DialogTitle>
          <DialogDescription>
            {newPassword
              ? "Новый пароль успешно сгенерирован. Скопируйте его и передайте пользователю."
              : `Вы уверены, что хотите сбросить пароль для пользователя ${user?.name || user?.email}? Будет сгенерирован новый временный пароль.`}
          </DialogDescription>
        </DialogHeader>

        {newPassword ? (
          <div className="space-y-4">
            <div className="rounded-md bg-muted p-4">
              <label className="text-sm font-medium mb-2 block">
                Новый пароль:
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={newPassword}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  title="Скопировать пароль"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              ⚠️ Сохраните этот пароль! Он больше не будет показан.
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="rounded-md bg-destructive/10 p-3">
                <p className="text-sm text-destructive">
                  {error instanceof Error
                    ? error.message
                    : "Произошла ошибка. Попробуйте еще раз."}
                </p>
              </div>
            )}
          </>
        )}

        <DialogFooter>
          {newPassword ? (
            <Button type="button" onClick={handleClose}>
              Закрыть
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Отмена
              </Button>
              <Button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
              >
                {isLoading ? "Сброс пароля..." : "Сбросить пароль"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



















