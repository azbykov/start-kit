"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  updateMatchPlayerSchema,
} from "@/lib/validations/match";
import type {
  UpdateMatchPlayerInput,
} from "@/lib/validations/match";
import type { MatchPlayer } from "@/lib/types/matches";
import { useUpdateMatchPlayer } from "@/lib/hooks/use-admin-matches";

interface MatchPlayerEditDialogProps {
  matchId: string;
  player: MatchPlayer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MatchPlayerEditDialog({
  matchId,
  player,
  open,
  onOpenChange,
  onSuccess,
}: MatchPlayerEditDialogProps) {
  const updateMutation = useUpdateMatchPlayer();

  const form = useForm<UpdateMatchPlayerInput>({
    resolver: zodResolver(updateMatchPlayerSchema),
    defaultValues: {
      goals: player.goals,
      assists: player.assists,
      yellowCards: player.yellowCards,
      redCards: player.redCards,
      minutesPlayed: player.minutesPlayed,
      isStarter: player.isStarter,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;

  // Reset form when player changes
  React.useEffect(() => {
    if (player) {
      reset({
        goals: player.goals,
        assists: player.assists,
        yellowCards: player.yellowCards,
        redCards: player.redCards,
        minutesPlayed: player.minutesPlayed,
        isStarter: player.isStarter,
      });
    }
  }, [player, reset]);

  const watchedIsStarter = watch("isStarter");

  const onSubmit = async (data: UpdateMatchPlayerInput) => {
    try {
      await updateMutation.mutateAsync({
        matchId,
        playerId: player.playerId,
        data,
      });
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const isLoading = updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Редактировать статистику игрока</DialogTitle>
          <DialogDescription>
            Измените статистику игрока {player.playerName} в матче.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goals">Голы</Label>
              <Input
                id="goals"
                type="number"
                min="0"
                {...register("goals", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.goals && (
                <p className="text-sm text-destructive">{errors.goals.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assists">Голевые передачи</Label>
              <Input
                id="assists"
                type="number"
                min="0"
                {...register("assists", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.assists && (
                <p className="text-sm text-destructive">{errors.assists.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yellowCards">Желтые карточки</Label>
              <Input
                id="yellowCards"
                type="number"
                min="0"
                {...register("yellowCards", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.yellowCards && (
                <p className="text-sm text-destructive">{errors.yellowCards.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="redCards">Красные карточки</Label>
              <Input
                id="redCards"
                type="number"
                min="0"
                max="1"
                {...register("redCards", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.redCards && (
                <p className="text-sm text-destructive">{errors.redCards.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minutesPlayed">Сыграно минут</Label>
            <Input
              id="minutesPlayed"
              type="number"
              min="0"
              max="120"
              {...register("minutesPlayed", { valueAsNumber: true })}
              disabled={isLoading}
            />
            {errors.minutesPlayed && (
              <p className="text-sm text-destructive">{errors.minutesPlayed.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isStarter"
              checked={watchedIsStarter}
              onCheckedChange={(checked) => setValue("isStarter", !!checked)}
              disabled={isLoading}
            />
            <Label htmlFor="isStarter" className="cursor-pointer">
              В стартовом составе
            </Label>
          </div>

          {updateMutation.error && (
            <div className="text-sm text-destructive">
              {updateMutation.error instanceof Error
                ? updateMutation.error.message
                : "Ошибка при обновлении статистики игрока"}
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


