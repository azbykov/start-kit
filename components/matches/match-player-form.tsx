"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  addMatchPlayerSchema,
  updateMatchPlayerSchema,
} from "@/lib/validations/match";
import type {
  AddMatchPlayerInput,
  UpdateMatchPlayerInput,
} from "@/lib/validations/match";
import type { MatchPlayer } from "@/lib/types/matches";
import {
  useAddMatchPlayer,
  useUpdateMatchPlayer,
} from "@/lib/hooks/use-admin-matches";
import { useTeamPlayers } from "@/lib/hooks/use-teams";

interface MatchPlayerFormProps {
  matchId: string;
  teamId: string;
  player?: MatchPlayer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MatchPlayerForm({
  matchId,
  teamId,
  player,
  open,
  onOpenChange,
  onSuccess,
}: MatchPlayerFormProps) {
  const isEditMode = !!player;
  const addMutation = useAddMatchPlayer();
  const updateMutation = useUpdateMatchPlayer();
  const { data: playersData } = useTeamPlayers(teamId);
  const players = playersData || [];

  const form = useForm<AddMatchPlayerInput | UpdateMatchPlayerInput>({
    resolver: zodResolver(
      isEditMode ? updateMatchPlayerSchema : addMatchPlayerSchema
    ),
    defaultValues:
      isEditMode && player
        ? {
            playerId: player.playerId,
            teamId: player.teamId,
            goals: player.goals,
            assists: player.assists,
            yellowCards: player.yellowCards,
            redCards: player.redCards,
            minutesPlayed: player.minutesPlayed,
            isStarter: player.isStarter,
          }
        : {
            playerId: "",
            teamId: teamId,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            minutesPlayed: 0,
            isStarter: false,
          },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = form;

  React.useEffect(() => {
    if (isEditMode && player) {
      reset({
        playerId: player.playerId,
        teamId: player.teamId,
        goals: player.goals,
        assists: player.assists,
        yellowCards: player.yellowCards,
        redCards: player.redCards,
        minutesPlayed: player.minutesPlayed,
        isStarter: player.isStarter,
      });
    } else {
      reset({
        playerId: "",
        teamId: teamId,
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
        minutesPlayed: 0,
        isStarter: false,
      });
    }
  }, [player, isEditMode, reset, teamId]);

  const isLoading = addMutation.isPending || updateMutation.isPending;

  const onSubmit = async (
    data: AddMatchPlayerInput | UpdateMatchPlayerInput
  ) => {
    try {
      if (isEditMode && player) {
        await updateMutation.mutateAsync({
          matchId,
          playerId: player.playerId,
          data: {
            goals: data.goals,
            assists: data.assists,
            yellowCards: data.yellowCards,
            redCards: data.redCards,
            minutesPlayed: data.minutesPlayed,
            isStarter: data.isStarter,
          },
        });
      } else {
        await addMutation.mutateAsync({
          matchId,
          data: {
            playerId: data.playerId!,
            teamId: data.teamId!,
            goals: data.goals || 0,
            assists: data.assists || 0,
            yellowCards: data.yellowCards || 0,
            redCards: data.redCards || 0,
            minutesPlayed: data.minutesPlayed || 0,
            isStarter: data.isStarter || false,
          },
        });
      }
      onSuccess?.();
      onOpenChange(false);
      reset();
    } catch (error) {
      // Error handling is done by mutation
    }
  };

  const isStarter = watch("isStarter");
  const formError = addMutation.error || updateMutation.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Редактировать статистику игрока" : "Добавить игрока в матч"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Измените статистику игрока в матче."
              : "Выберите игрока и заполните его статистику."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="playerId">
                Игрок <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("playerId")}
                onValueChange={(value) => {
                  setValue("playerId", value, { shouldValidate: true });
                }}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите игрока" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.firstName} {p.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.playerId && (
                <p className="text-sm text-destructive">
                  {errors.playerId.message as string}
                </p>
              )}
            </div>
          )}

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
                <p className="text-sm text-destructive">
                  {errors.goals.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assists">Ассисты</Label>
              <Input
                id="assists"
                type="number"
                min="0"
                {...register("assists", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.assists && (
                <p className="text-sm text-destructive">
                  {errors.assists.message as string}
                </p>
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
                <p className="text-sm text-destructive">
                  {errors.yellowCards.message as string}
                </p>
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
                <p className="text-sm text-destructive">
                  {errors.redCards.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="minutesPlayed">Минуты на поле</Label>
            <Input
              id="minutesPlayed"
              type="number"
              min="0"
              max="120"
              {...register("minutesPlayed", { valueAsNumber: true })}
              disabled={isLoading}
            />
            {errors.minutesPlayed && (
              <p className="text-sm text-destructive">
                {errors.minutesPlayed.message as string}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isStarter"
              checked={isStarter}
              onCheckedChange={(checked) => {
                setValue("isStarter", checked === true, {
                  shouldValidate: true,
                });
              }}
              disabled={isLoading}
            />
            <Label
              htmlFor="isStarter"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              В стартовом составе
            </Label>
          </div>
          {errors.isStarter && (
            <p className="text-sm text-destructive">
              {errors.isStarter.message as string}
            </p>
          )}

          {formError && (
            <div className="text-sm text-destructive">
              {formError.message}
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
              {isLoading
                ? "Сохранение..."
                : isEditMode
                ? "Сохранить"
                : "Добавить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}













