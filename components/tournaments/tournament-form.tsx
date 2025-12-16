"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  createTournamentFormSchema,
} from "@/lib/validations/tournament";
import type { Tournament } from "@/lib/types/tournaments";
import { useCreateTournament, useUpdateTournament } from "@/lib/hooks/use-admin-tournaments";
import { cn } from "@/lib/utils";

type TournamentFormValues = z.input<typeof createTournamentFormSchema>;

const CUSTOM_OPTION_VALUE = "__custom__";

const statusLabels: Record<
  "PLANNED" | "ACTIVE" | "FINISHED" | "CANCELLED",
  string
> = {
  PLANNED: "Запланирован",
  ACTIVE: "Идёт",
  FINISHED: "Завершён",
  CANCELLED: "Отменён",
};

const genderLabels: Record<"MALE" | "FEMALE" | "MIXED", string> = {
  MALE: "Мужской",
  FEMALE: "Женский",
  MIXED: "Смешанный",
};

const ageGroupOptions = [
  "до 6 лет",
  "до 7 лет",
  "до 8 лет",
  "до 9 лет",
  "до 10 лет",
  "до 11 лет",
  "до 12 лет",
  "до 13 лет",
  "до 14 лет",
  "до 15 лет",
  "до 16 лет",
  "до 17 лет",
  "до 18 лет",
  "до 21 года",
] as const;

function getSeasonOptions() {
  const nowYear = new Date().getFullYear();
  const start = nowYear - 2;
  const end = nowYear + 2;
  const seasons: string[] = [];
  for (let y = start; y <= end; y += 1) {
    seasons.push(`${y}/${y + 1}`);
  }
  return seasons.reverse();
}

interface TournamentFormProps {
  tournament?: Tournament | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TournamentForm({
  tournament,
  open,
  onOpenChange,
  onSuccess,
}: TournamentFormProps) {
  const isEditMode = !!tournament;
  const createMutation = useCreateTournament();
  const updateMutation = useUpdateTournament();
  const seasonOptions = React.useMemo(() => getSeasonOptions(), []);

  const form = useForm<TournamentFormValues>({
    resolver: zodResolver(createTournamentFormSchema),
    defaultValues:
      isEditMode && tournament
        ? {
            name: tournament.name,
            organizer: tournament.organizer || "",
            description: tournament.description || "",
            season: tournament.season || "",
            location: tournament.location || "",
            sport: tournament.sport || "",
            format: tournament.format || "",
            gender: tournament.gender || undefined,
            ageGroup: tournament.ageGroup || "",
            birthYearFrom: tournament.birthYearFrom
              ? String(tournament.birthYearFrom)
              : "",
            birthYearTo: tournament.birthYearTo ? String(tournament.birthYearTo) : "",
            status: tournament.status || "ACTIVE",
            logo: tournament.logo || "",
            startDate: tournament.startDate || "",
            endDate: tournament.endDate || "",
            isActive: tournament.isActive,
          }
        : {
            name: "",
            organizer: "",
            description: "",
            season: "",
            location: "",
            sport: "",
            format: "",
            gender: undefined,
            ageGroup: "",
            birthYearFrom: "",
            birthYearTo: "",
            status: "ACTIVE",
            logo: "",
            startDate: "",
            endDate: "",
            isActive: true,
          },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = form;

  const [isCustomSeason, setIsCustomSeason] = React.useState(false);
  const [isCustomAgeGroup, setIsCustomAgeGroup] = React.useState(false);

  // Reset form when tournament changes (for edit mode)
  React.useEffect(() => {
    if (isEditMode && tournament) {
      reset({
        name: tournament.name,
        organizer: tournament.organizer || "",
        description: tournament.description || "",
        season: tournament.season || "",
        location: tournament.location || "",
        sport: tournament.sport || "",
        format: tournament.format || "",
        gender: tournament.gender || undefined,
        ageGroup: tournament.ageGroup || "",
        birthYearFrom: tournament.birthYearFrom
          ? String(tournament.birthYearFrom)
          : "",
        birthYearTo: tournament.birthYearTo ? String(tournament.birthYearTo) : "",
        status: tournament.status || "ACTIVE",
        logo: tournament.logo || "",
        startDate: tournament.startDate || "",
        endDate: tournament.endDate || "",
        isActive: tournament.isActive,
      });
      setIsCustomSeason(
        !!tournament.season && !seasonOptions.includes(tournament.season)
      );
      setIsCustomAgeGroup(
        !!tournament.ageGroup &&
          !ageGroupOptions.includes(tournament.ageGroup as any)
      );
    } else {
      reset({
        name: "",
        organizer: "",
        description: "",
        season: "",
        location: "",
        sport: "",
        format: "",
        gender: undefined,
        ageGroup: "",
        birthYearFrom: "",
        birthYearTo: "",
        status: "ACTIVE",
        logo: "",
        startDate: "",
        endDate: "",
        isActive: true,
      });
      setIsCustomSeason(false);
      setIsCustomAgeGroup(false);
    }
  }, [tournament, isEditMode, reset]);

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (data: TournamentFormValues) => {
    try {
      form.clearErrors();

      if (isEditMode && tournament) {
        await updateMutation.mutateAsync({
          id: tournament.id,
          data: {
            name: data.name,
            organizer: data.organizer || null,
            description: data.description || null,
            season: data.season || null,
            location: data.location || null,
            sport: data.sport || null,
            format: data.format || null,
            gender: data.gender ?? null,
            ageGroup: data.ageGroup || null,
            birthYearFrom: data.birthYearFrom ? Number(data.birthYearFrom) : null,
            birthYearTo: data.birthYearTo ? Number(data.birthYearTo) : null,
            status: data.status ?? "ACTIVE",
            logo: data.logo || null,
            startDate: data.startDate || null,
            endDate: data.endDate || null,
            isActive: data.isActive ?? true,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: data.name!,
          organizer: data.organizer || null,
          description: data.description || null,
          season: data.season || null,
          location: data.location || null,
          sport: data.sport || null,
          format: data.format || null,
          gender: data.gender ?? null,
          ageGroup: data.ageGroup || null,
          birthYearFrom: data.birthYearFrom ? Number(data.birthYearFrom) : null,
          birthYearTo: data.birthYearTo ? Number(data.birthYearTo) : null,
          status: data.status ?? "ACTIVE",
          logo: data.logo || null,
          startDate: data.startDate || null,
          endDate: data.endDate || null,
          isActive: data.isActive ?? true,
        });
      }
      onSuccess?.();
      onOpenChange(false);
      reset();
    } catch (error) {
      const maybeFieldErrors = error as Error & {
        fieldErrors?: Record<string, string[]>;
      };

      if (maybeFieldErrors?.fieldErrors) {
        Object.entries(maybeFieldErrors.fieldErrors).forEach(
          ([field, messages]) => {
            const message = messages?.[0];
            if (!message) return;
            form.setError(field as any, { type: "server", message });
          }
        );
      }

      if (maybeFieldErrors?.message) {
        form.setError("root.server", {
          type: "server",
          message: maybeFieldErrors.message,
        });
      }
    }
  };

  const isActive = watch("isActive") ?? true;
  const watchedStatus = watch("status") || "ACTIVE";
  const watchedGender = watch("gender");
  const watchedSeason = watch("season") || "";
  const watchedAgeGroup = watch("ageGroup") || "";

  const formError = createMutation.error || updateMutation.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Редактировать турнир" : "Создать турнир"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Измените данные турнира."
              : "Заполните форму для создания нового турнира."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Название <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              {...register("name")}
              placeholder="Чемпионат мира"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">
                {errors.name.message as string}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organizer">Организатор</Label>
              <Input
                id="organizer"
                type="text"
                {...register("organizer")}
                placeholder="Федерация футбола Санкт-Петербурга"
                disabled={isLoading}
              />
              {errors.organizer && (
                <p className="text-sm text-destructive">
                  {errors.organizer.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Статус</Label>
              <Select
                value={watchedStatus}
                onValueChange={(value) =>
                  form.setValue("status", value as TournamentFormValues["status"], {
                    shouldValidate: true,
                  })
                }
                disabled={isLoading}
              >
                <SelectTrigger id="status">
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
                <p className="text-sm text-destructive">
                  {errors.status.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <textarea
              id="description"
              {...register("description")}
              rows={4}
              className={cn(
                "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
              )}
              placeholder="Подробное описание турнира..."
              disabled={isLoading}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message as string}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="season">Сезон</Label>
              <Select
                value={isCustomSeason ? CUSTOM_OPTION_VALUE : watchedSeason}
                onValueChange={(value) => {
                  if (value === CUSTOM_OPTION_VALUE) {
                    setIsCustomSeason(true);
                    form.setValue("season", "", { shouldValidate: true });
                    return;
                  }
                  setIsCustomSeason(false);
                  form.setValue("season", value, { shouldValidate: true });
                }}
                disabled={isLoading}
              >
                <SelectTrigger id="season">
                  <SelectValue placeholder="Выберите" />
                </SelectTrigger>
                <SelectContent>
                  {seasonOptions.map((season) => (
                    <SelectItem key={season} value={season}>
                      {season}
                    </SelectItem>
                  ))}
                  <SelectItem value={CUSTOM_OPTION_VALUE}>Другое…</SelectItem>
                </SelectContent>
              </Select>
              {isCustomSeason && (
                <Input
                  className="mt-2"
                  type="text"
                  {...register("season")}
                  placeholder="Например: 2025/2026"
                  disabled={isLoading}
                />
              )}
              {errors.season && (
                <p className="text-sm text-destructive">
                  {errors.season.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Локация</Label>
              <Input
                id="location"
                type="text"
                {...register("location")}
                placeholder="Москва, Россия"
                disabled={isLoading}
              />
              {errors.location && (
                <p className="text-sm text-destructive">
                  {errors.location.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sport">Вид спорта</Label>
              <Input
                id="sport"
                type="text"
                {...register("sport")}
                placeholder="Мини-футбол"
                disabled={isLoading}
              />
              {errors.sport && (
                <p className="text-sm text-destructive">
                  {errors.sport.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Формат</Label>
              <Input
                id="format"
                type="text"
                {...register("format")}
                placeholder="8x8"
                disabled={isLoading}
              />
              {errors.format && (
                <p className="text-sm text-destructive">
                  {errors.format.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Пол участников</Label>
              <Select
                value={watchedGender}
                onValueChange={(value) =>
                  form.setValue("gender", value as TournamentFormValues["gender"], {
                    shouldValidate: true,
                  })
                }
                disabled={isLoading}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Выберите" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(genderLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-destructive">
                  {errors.gender.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ageGroup">Возрастная группа</Label>
              <Select
                value={isCustomAgeGroup ? CUSTOM_OPTION_VALUE : watchedAgeGroup}
                onValueChange={(value) => {
                  if (value === CUSTOM_OPTION_VALUE) {
                    setIsCustomAgeGroup(true);
                    form.setValue("ageGroup", "", { shouldValidate: true });
                    return;
                  }
                  setIsCustomAgeGroup(false);
                  form.setValue("ageGroup", value, { shouldValidate: true });
                }}
                disabled={isLoading}
              >
                <SelectTrigger id="ageGroup">
                  <SelectValue placeholder="Выберите" />
                </SelectTrigger>
                <SelectContent>
                  {ageGroupOptions.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                  <SelectItem value={CUSTOM_OPTION_VALUE}>Другое…</SelectItem>
                </SelectContent>
              </Select>
              {isCustomAgeGroup && (
                <Input
                  className="mt-2"
                  type="text"
                  {...register("ageGroup")}
                  placeholder="Например: до 12 лет"
                  disabled={isLoading}
                />
              )}
              {errors.ageGroup && (
                <p className="text-sm text-destructive">
                  {errors.ageGroup.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="birthYearFrom">Год рождения с</Label>
              <Input
                id="birthYearFrom"
                type="number"
                min="1900"
                max="2100"
                {...register("birthYearFrom")}
                placeholder="2015"
                disabled={isLoading}
              />
              {errors.birthYearFrom && (
                <p className="text-sm text-destructive">
                  {errors.birthYearFrom.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthYearTo">Год рождения по</Label>
              <Input
                id="birthYearTo"
                type="number"
                min="1900"
                max="2100"
                {...register("birthYearTo")}
                placeholder="2016"
                disabled={isLoading}
              />
              {errors.birthYearTo && (
                <p className="text-sm text-destructive">
                  {errors.birthYearTo.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Логотип (URL)</Label>
            <Input
              id="logo"
              type="url"
              {...register("logo")}
              placeholder="https://example.com/logo.png"
              disabled={isLoading}
            />
            {errors.logo && (
              <p className="text-sm text-destructive">
                {errors.logo.message as string}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Дата начала</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate")}
                disabled={isLoading}
              />
              {errors.startDate && (
                <p className="text-sm text-destructive">
                  {errors.startDate.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Дата окончания</Label>
              <Input
                id="endDate"
                type="date"
                {...register("endDate")}
                disabled={isLoading}
              />
              {errors.endDate && (
                <p className="text-sm text-destructive">
                  {errors.endDate.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => {
                form.setValue("isActive", checked === true, {
                  shouldValidate: true,
                });
              }}
              disabled={isLoading}
            />
            <Label
              htmlFor="isActive"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Показывать турнир на сайте
            </Label>
          </div>
          {errors.isActive && (
            <p className="text-sm text-destructive">
              {errors.isActive.message as string}
            </p>
          )}

          {errors.root?.server?.message && (
            <div className="text-sm text-destructive">
              {errors.root.server.message}
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

