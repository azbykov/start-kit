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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  createMatchFormSchema,
  updateMatchFormSchema,
} from "@/lib/validations/match";
import type {
  CreateMatchFormInput,
  UpdateMatchFormInput,
} from "@/lib/validations/match";
import type { Match } from "@/lib/types/matches";
import { useCreateMatch, useUpdateMatch } from "@/lib/hooks/use-admin-matches";
import { useAllTeams } from "@/lib/hooks/use-teams";
import { useAllTournaments } from "@/lib/hooks/use-tournaments";

interface MatchFormProps {
  match?: Match | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function MatchForm({
  match,
  open,
  onOpenChange,
  onSuccess,
}: MatchFormProps) {
  const isEditMode = !!match;
  const createMutation = useCreateMatch();
  const updateMutation = useUpdateMatch();
  const { data: teamsData } = useAllTeams();
  const { data: tournamentsData } = useAllTournaments();
  const teams = teamsData || [];
  const tournaments = tournamentsData || [];

  const form = useForm<CreateMatchFormInput | UpdateMatchFormInput>({
    resolver: zodResolver(
      isEditMode ? updateMatchFormSchema : createMatchFormSchema
    ),
    defaultValues:
      isEditMode && match
        ? {
            date: match.date,
            time: match.time || "",
            stadium: match.stadium || "",
            status: match.status,
            homeTeamId: match.homeTeamId,
            awayTeamId: match.awayTeamId,
            homeScore: match.homeScore?.toString() || "",
            awayScore: match.awayScore?.toString() || "",
            tournamentId: match.tournamentId || undefined,
          }
        : {
            date: "",
            time: "",
            stadium: "",
            status: "SCHEDULED",
            homeTeamId: "",
            awayTeamId: "",
            homeScore: "",
            awayScore: "",
            tournamentId: undefined,
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

  // Reset form when match changes (for edit mode)
  React.useEffect(() => {
    if (isEditMode && match) {
      reset({
        date: match.date,
        time: match.time || "",
        stadium: match.stadium || "",
        status: match.status,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        homeScore: match.homeScore?.toString() || "",
        awayScore: match.awayScore?.toString() || "",
        tournamentId: match.tournamentId || "",
      });
    } else {
      reset({
        date: "",
        time: "",
        stadium: "",
        status: "SCHEDULED",
        homeTeamId: "",
        awayTeamId: "",
        homeScore: "",
        awayScore: "",
        tournamentId: "",
      });
    }
  }, [match, isEditMode, reset]);

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (
    data: CreateMatchFormInput | UpdateMatchFormInput
  ) => {
    try {
      if (isEditMode && match) {
        await updateMutation.mutateAsync({
          id: match.id,
          data: {
            date: data.date || undefined,
            time: data.time || null,
            stadium: data.stadium || null,
            status: data.status,
            homeTeamId: data.homeTeamId || undefined,
            awayTeamId: data.awayTeamId || undefined,
            homeScore: data.homeScore ? parseInt(data.homeScore, 10) : null,
            awayScore: data.awayScore ? parseInt(data.awayScore, 10) : null,
            tournamentId: data.tournamentId || null,
          },
        });
      } else {
        await createMutation.mutateAsync({
          date: data.date!,
          time: data.time || null,
          stadium: data.stadium || null,
          status: data.status || "SCHEDULED",
          homeTeamId: data.homeTeamId!,
          awayTeamId: data.awayTeamId!,
          homeScore: data.homeScore ? parseInt(data.homeScore, 10) : null,
          awayScore: data.awayScore ? parseInt(data.awayScore, 10) : null,
          tournamentId: data.tournamentId || null,
        });
      }
      onSuccess?.();
      onOpenChange(false);
      reset();
    } catch (error) {
      // Error handling is done by mutation
    }
  };

  const status = watch("status");
  const formError = createMutation.error || updateMutation.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Редактировать матч" : "Создать матч"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Измените данные матча."
              : "Заполните форму для создания нового матча."}
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
                <p className="text-sm text-destructive">
                  {errors.date.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Время (HH:MM)</Label>
              <Input
                id="time"
                type="text"
                {...register("time")}
                placeholder="20:00"
                disabled={isLoading}
              />
              {errors.time && (
                <p className="text-sm text-destructive">
                  {errors.time.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stadium">Стадион</Label>
            <Input
              id="stadium"
              type="text"
              {...register("stadium")}
              placeholder="Стадион Лужники"
              disabled={isLoading}
            />
            {errors.stadium && (
              <p className="text-sm text-destructive">
                {errors.stadium.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Статус</Label>
            <Select
              value={status}
              onValueChange={(value) => {
                setValue("status", value as "SCHEDULED" | "LIVE" | "FINISHED" | "CANCELLED", {
                  shouldValidate: true,
                });
              }}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCHEDULED">Запланирован</SelectItem>
                <SelectItem value="LIVE">В эфире</SelectItem>
                <SelectItem value="FINISHED">Завершен</SelectItem>
                <SelectItem value="CANCELLED">Отменен</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive">
                {errors.status.message as string}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="homeTeamId">
                Команда хозяев <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("homeTeamId")}
                onValueChange={(value) => {
                  setValue("homeTeamId", value, { shouldValidate: true });
                }}
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
                <p className="text-sm text-destructive">
                  {errors.homeTeamId.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="awayTeamId">
                Команда гостей <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("awayTeamId")}
                onValueChange={(value) => {
                  setValue("awayTeamId", value, { shouldValidate: true });
                }}
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
                <p className="text-sm text-destructive">
                  {errors.awayTeamId.message as string}
                </p>
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
                <p className="text-sm text-destructive">
                  {errors.homeScore.message as string}
                </p>
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
                <p className="text-sm text-destructive">
                  {errors.awayScore.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tournamentId">Турнир</Label>
            <Select
              value={watch("tournamentId") || "none"}
              onValueChange={(value) => {
                setValue("tournamentId", value === "none" ? undefined : value, {
                  shouldValidate: true,
                });
              }}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите турнир (опционально)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Без турнира</SelectItem>
                {tournaments.map((tournament) => (
                  <SelectItem key={tournament.id} value={tournament.id}>
                      <span title={tournament.name}>
                        {tournament.shortName || tournament.name}
                      </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.tournamentId && (
              <p className="text-sm text-destructive">
                {errors.tournamentId.message as string}
              </p>
            )}
          </div>

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
                : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

