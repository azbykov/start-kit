"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addMatchPlayerSchema } from "@/lib/validations/match";
import type { AddMatchPlayerInput } from "@/lib/validations/match";
import { useAddMatchPlayer } from "@/lib/hooks/use-admin-matches";
import { useQuery } from "@tanstack/react-query";
import { getTeamPlayers } from "@/lib/api/teams";
import { Position } from "@prisma/client";

interface MatchPlayerAddDialogProps {
  matchId: string;
  teamId: string;
  teamName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MatchPlayerAddDialog({
  matchId,
  teamId,
  teamName,
  open,
  onOpenChange,
  onSuccess,
}: MatchPlayerAddDialogProps) {
  const addMutation = useAddMatchPlayer();

  const { data: players, isLoading: playersLoading } = useQuery({
    queryKey: ["team", teamId, "players"],
    queryFn: () => getTeamPlayers(teamId),
    enabled: open && !!teamId,
  });

  const form = useForm<AddMatchPlayerInput>({
    resolver: zodResolver(addMatchPlayerSchema),
    defaultValues: {
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
    setValue,
    watch,
  } = form;

  // Reset form when dialog opens
  React.useEffect(() => {
    if (open) {
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
  }, [open, teamId, reset]);

  const watchedIsStarter = watch("isStarter");
  const watchedPlayerId = watch("playerId");

  // Get selected player data
  const selectedPlayer = players?.find((p) => p.id === watchedPlayerId);

  // Filter out players already in match
  const availablePlayers = players?.filter((player) => {
    // TODO: фильтровать игроков, которые уже добавлены в матч
    return true;
  });

  // Position labels
  const positionLabels: Record<Position, string> = {
    GK: "Вратарь",
    CB: "Центральный защитник",
    LB: "Левый защитник",
    RB: "Правый защитник",
    CM: "Центральный полузащитник",
    CDM: "Опорный полузащитник",
    CAM: "Атакующий полузащитник",
    LM: "Левый полузащитник",
    RM: "Правый полузащитник",
    CF: "Центральный нападающий",
    SS: "Второй нападающий",
    LW: "Левый вингер",
    RW: "Правый вингер",
  };

  const onSubmit = async (data: AddMatchPlayerInput) => {
    try {
      await addMutation.mutateAsync({
        matchId,
        data,
      });
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const isLoading = addMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Добавить игрока</DialogTitle>
          <DialogDescription>
            Добавьте игрока в состав команды {teamName}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="playerId">
              Игрок <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watchedPlayerId}
              onValueChange={(value) => setValue("playerId", value)}
              disabled={isLoading || playersLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите игрока" />
              </SelectTrigger>
              <SelectContent>
                {availablePlayers?.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    <div className="flex items-center gap-2">
                      <span>{player.firstName} {player.lastName}</span>
                      {player.position && player.position.length > 0 && (
                        <span className="text-muted-foreground text-xs">
                          ({player.position[0]})
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.playerId && (
              <p className="text-sm text-destructive">{errors.playerId.message}</p>
            )}
          </div>

          {selectedPlayer && selectedPlayer.position && selectedPlayer.position.length > 0 && (
            <div className="space-y-2">
              <Label>Позиция игрока</Label>
              <div className="flex gap-2 flex-wrap">
                {selectedPlayer.position.map((pos) => (
                  <Badge key={pos} variant="secondary" className="text-xs">
                    {positionLabels[pos as Position] || pos}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Позиция по умолчанию из профиля игрока
              </p>
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

          {addMutation.error && (
            <div className="text-sm text-destructive">
              {addMutation.error instanceof Error
                ? addMutation.error.message
                : "Ошибка при добавлении игрока"}
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
              {isLoading ? "Добавление..." : "Добавить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

