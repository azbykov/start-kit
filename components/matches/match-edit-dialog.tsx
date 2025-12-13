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
import {
  updateMatchFormSchema,
} from "@/lib/validations/match";
import type {
  UpdateMatchFormInput,
} from "@/lib/validations/match";
import type { MatchProfile } from "@/lib/types/matches";
import { useUpdateMatch } from "@/lib/hooks/use-admin-matches";
import { useQuery } from "@tanstack/react-query";
import { getTeamsList } from "@/lib/api/teams";
import { getTournamentsList } from "@/lib/api/tournaments";
import { MatchStatus } from "@prisma/client";

interface MatchEditDialogProps {
  match: MatchProfile;
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

export function MatchEditDialog({
  match,
  open,
  onOpenChange,
  onSuccess,
}: MatchEditDialogProps) {
  const updateMutation = useUpdateMatch();

  const { data: teamsData } = useQuery({
    queryKey: ["teams", "list"],
    queryFn: () => getTeamsList({ page: 1, pageSize: 1000 }),
  });

  const { data: tournamentsData } = useQuery({
    queryKey: ["tournaments", "list"],
    queryFn: () => getTournamentsList({ page: 1, pageSize: 1000 }),
  });

  const form = useForm<UpdateMatchFormInput>({
    resolver: zodResolver(updateMatchFormSchema),
    defaultValues: {
      date: match.date,
      time: match.time || "",
      stadium: match.stadium || "",
      status: match.status,
      homeTeamId: match.homeTeam.id,
      awayTeamId: match.awayTeam.id,
      homeScore: match.homeScore?.toString() || "",
      awayScore: match.awayScore?.toString() || "",
      tournamentId: match.tournament?.id || "",
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

  // Reset form when match changes
  React.useEffect(() => {
    if (match) {
      reset({
        date: match.date,
        time: match.time || "",
        stadium: match.stadium || "",
        status: match.status,
        homeTeamId: match.homeTeam.id,
        awayTeamId: match.awayTeam.id,
        homeScore: match.homeScore?.toString() || "",
        awayScore: match.awayScore?.toString() || "",
        tournamentId: match.tournament?.id || "",
      });
    }
  }, [match, reset]);

  const watchedStatus = watch("status");
  const watchedHomeTeamId = watch("homeTeamId");
  const watchedAwayTeamId = watch("awayTeamId");

  const onSubmit = async (data: UpdateMatchFormInput) => {
    try {
      const updateData: any = {};
      
      if (data.date !== undefined) updateData.date = data.date;
      if (data.time !== undefined) updateData.time = data.time || null;
      if (data.stadium !== undefined) updateData.stadium = data.stadium || null;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.homeTeamId !== undefined) updateData.homeTeamId = data.homeTeamId;
      if (data.awayTeamId !== undefined) updateData.awayTeamId = data.awayTeamId;
      if (data.homeScore !== undefined) {
        updateData.homeScore = data.homeScore ? parseInt(data.homeScore, 10) : null;
      }
      if (data.awayScore !== undefined) {
        updateData.awayScore = data.awayScore ? parseInt(data.awayScore, 10) : null;
      }
      if (data.tournamentId !== undefined) {
        updateData.tournamentId = data.tournamentId || null;
      }

      await updateMutation.mutateAsync({
        id: match.id,
        data: updateData,
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
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать матч</DialogTitle>
          <DialogDescription>
            Измените данные матча. Все поля опциональны.
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
              <Label htmlFor="time">Время (HH:MM)</Label>
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
              placeholder="Название стадиона"
              disabled={isLoading}
            />
            {errors.stadium && (
              <p className="text-sm text-destructive">{errors.stadium.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Статус</Label>
            <Select
              value={watchedStatus}
              onValueChange={(value) => setValue("status", value as MatchStatus)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите статус" />
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
                  {teamsData?.teams.map((team) => (
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
                  {teamsData?.teams.map((team) => (
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="homeScore">Счет хозяев</Label>
              <Input
                id="homeScore"
                type="number"
                min="0"
                {...register("homeScore")}
                placeholder="0"
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
                placeholder="0"
                disabled={isLoading}
              />
              {errors.awayScore && (
                <p className="text-sm text-destructive">{errors.awayScore.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tournamentId">Турнир</Label>
            <Select
              value={watch("tournamentId") || "none"}
              onValueChange={(value) => setValue("tournamentId", value === "none" ? "" : value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите турнир" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Без турнира</SelectItem>
                {tournamentsData?.tournaments.map((tournament) => (
                  <SelectItem key={tournament.id} value={tournament.id}>
                    {tournament.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tournamentId && (
              <p className="text-sm text-destructive">{errors.tournamentId.message}</p>
            )}
          </div>

          {updateMutation.error && (
            <div className="text-sm text-destructive">
              {updateMutation.error instanceof Error
                ? updateMutation.error.message
                : "Ошибка при обновлении матча"}
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

