"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createMatchFormSchema } from "@/lib/validations/match";
import type { CreateMatchFormInput } from "@/lib/validations/match";
import { useCreateMatch } from "@/lib/hooks/use-admin-matches";
import { MatchStatus } from "@prisma/client";

interface TournamentMatchAddDialogProps {
  tournamentId: string;
  teams: Array<{
    id: string;
    name: string;
    logo: string | null;
  }>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const statusLabels: Record<MatchStatus, string> = {
  SCHEDULED: "Запланирован",
  LIVE: "В эфире",
  FINISHED: "Завершен",
  CANCELLED: "Отменен",
};

export function TournamentMatchAddDialog({
  tournamentId,
  teams,
  open,
  onOpenChange,
  onSuccess,
}: TournamentMatchAddDialogProps) {
  const createMutation = useCreateMatch();

  const form = useForm<CreateMatchFormInput>({
    resolver: zodResolver(createMatchFormSchema),
    defaultValues: {
      date: "",
      time: "",
      stadium: "",
      status: "SCHEDULED",
      homeTeamId: "",
      awayTeamId: "",
      homeScore: "",
      awayScore: "",
      tournamentId: tournamentId,
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
        date: "",
        time: "",
        stadium: "",
        status: "SCHEDULED",
        homeTeamId: "",
        awayTeamId: "",
        homeScore: "",
        awayScore: "",
        tournamentId: tournamentId,
      });
    }
  }, [open, tournamentId, reset]);

  const watchedStatus = watch("status");
  const watchedHomeTeamId = watch("homeTeamId");
  const watchedAwayTeamId = watch("awayTeamId");

  const onSubmit = async (data: CreateMatchFormInput) => {
    try {
      await createMutation.mutateAsync({
        date: data.date,
        time: data.time || null,
        stadium: data.stadium || null,
        status: data.status,
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        homeScore: data.homeScore ? parseInt(data.homeScore, 10) : null,
        awayScore: data.awayScore ? parseInt(data.awayScore, 10) : null,
        tournamentId: data.tournamentId || null,
      });
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const isLoading = createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Добавить матч</DialogTitle>
          <DialogDescription>
            Добавьте новый матч в турнир. Выберите команды из участников турнира.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">
                Дата <span className="text-destructive">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                {...register("date")}
                disabled={isLoading}
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Время</Label>
              <Input
                id="time"
                type="time"
                {...register("time")}
                disabled={isLoading}
              />
              {errors.time && (
                <p className="text-sm text-destructive">{errors.time.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stadium">Стадион</Label>
            <Input
              id="stadium"
              {...register("stadium")}
              disabled={isLoading}
            />
            {errors.stadium && (
              <p className="text-sm text-destructive">{errors.stadium.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="homeTeamId">
                Команда хозяев <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watchedHomeTeamId}
                onValueChange={(value) => setValue("homeTeamId", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите команду" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.homeTeamId && (
                <p className="text-sm text-destructive">{errors.homeTeamId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="awayTeamId">
                Команда гостей <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watchedAwayTeamId}
                onValueChange={(value) => setValue("awayTeamId", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите команду" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.awayTeamId && (
                <p className="text-sm text-destructive">{errors.awayTeamId.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Статус</Label>
            <Select
              value={watchedStatus}
              onValueChange={(value) => setValue("status", value as MatchStatus)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive">{errors.status.message}</p>
            )}
          </div>

          {(watchedStatus === "FINISHED" || watchedStatus === "LIVE") && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="homeScore">Счет хозяев</Label>
                <Input
                  id="homeScore"
                  type="number"
                  min="0"
                  {...register("homeScore")}
                  disabled={isLoading}
                />
                {errors.homeScore && (
                  <p className="text-sm text-destructive">{errors.homeScore.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="awayScore">Счет гостей</Label>
                <Input
                  id="awayScore"
                  type="number"
                  min="0"
                  {...register("awayScore")}
                  disabled={isLoading}
                />
                {errors.awayScore && (
                  <p className="text-sm text-destructive">{errors.awayScore.message}</p>
                )}
              </div>
            </div>
          )}

          {createMutation.error && (
            <div className="text-sm text-destructive">
              {createMutation.error instanceof Error
                ? createMutation.error.message
                : "Ошибка при создании матча"}
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
              {isLoading ? "Создание..." : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

