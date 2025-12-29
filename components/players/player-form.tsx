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
  createPlayerFormSchema,
  updatePlayerFormSchema,
} from "@/lib/validations/player";
import type {
  CreatePlayerFormInput,
  UpdatePlayerFormInput,
} from "@/lib/validations/player";
import type { Player } from "@/lib/types/players";
import { Position } from "@prisma/client";
import { useCreatePlayer, useUpdatePlayer } from "@/lib/hooks/use-admin-players";
import { useAllTeams } from "@/lib/hooks/use-teams";

interface PlayerFormProps {
  player?: Player | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialTeamId?: string; // Предзаполнение команды при создании игрока со страницы команды
}

import { positionLabels } from "@/lib/utils/player";

export function PlayerForm({
  player,
  open,
  onOpenChange,
  onSuccess,
  initialTeamId,
}: PlayerFormProps) {
  const isEditMode = !!player;
  const createMutation = useCreatePlayer();
  const updateMutation = useUpdatePlayer();
  const { data: teamsData } = useAllTeams();
  const teams = teamsData || [];

  const form = useForm<CreatePlayerFormInput | UpdatePlayerFormInput>({
    resolver: zodResolver(isEditMode ? updatePlayerFormSchema : createPlayerFormSchema),
        defaultValues: isEditMode && player
      ? {
          firstName: player.firstName,
          lastName: player.lastName,
          position: player.position,
          dateOfBirth: player.dateOfBirth || "",
          teamId: player.teamId || "",
          image: player.image || "",
          totalMatches: player.totalMatches?.toString() || "0",
          totalGoals: player.totalGoals?.toString() || "0",
          totalAssists: player.totalAssists?.toString() || "0",
          totalMinutes: player.totalMinutes?.toString() || "0",
          videoLinks: player.videoLinks,
        }
      : {
          position: [Position.CF],
          teamId: initialTeamId || "",
          totalMatches: "0",
          totalGoals: "0",
          totalAssists: "0",
          totalMinutes: "0",
          videoLinks: [],
        },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = form;

  // Reset form when player changes (for edit mode)
  React.useEffect(() => {
    if (isEditMode && player) {
      reset({
        firstName: player.firstName,
        lastName: player.lastName,
        position: player.position,
        dateOfBirth: player.dateOfBirth || "",
        teamId: player.teamId || "",
        image: player.image || "",
        totalMatches: player.totalMatches?.toString() || "0",
        totalGoals: player.totalGoals?.toString() || "0",
        totalAssists: player.totalAssists?.toString() || "0",
        totalMinutes: player.totalMinutes?.toString() || "0",
        videoLinks: player.videoLinks,
      });
    } else if (!isEditMode) {
      reset({
        position: [Position.CF],
        teamId: initialTeamId || "",
        totalMatches: "0",
        totalGoals: "0",
        totalAssists: "0",
        totalMinutes: "0",
        videoLinks: [],
      });
    }
  }, [player, isEditMode, reset, initialTeamId]);

  const watchedPositions = watch("position") || [];
  const watchedVideoLinks = watch("videoLinks") || [];

  const togglePosition = (position: Position) => {
    const currentPositions = watchedPositions as Position[];
    if (currentPositions.includes(position)) {
      setValue("position", currentPositions.filter((p) => p !== position), {
        shouldValidate: true,
      });
    } else {
      setValue("position", [...currentPositions, position], {
        shouldValidate: true,
      });
    }
  };

  const onSubmit = async (data: CreatePlayerFormInput | UpdatePlayerFormInput) => {
    try {
      // Convert form data to API format (filter empty video links)
      const filteredVideoLinks = (data.videoLinks || []).filter(
        (link) => link.trim() !== ""
      );

      const apiData: any = {
        ...data,
        videoLinks: filteredVideoLinks,
        totalMatches: typeof data.totalMatches === "string" ? parseInt(data.totalMatches, 10) || 0 : data.totalMatches || 0,
        totalGoals: typeof data.totalGoals === "string" ? parseInt(data.totalGoals, 10) || 0 : data.totalGoals || 0,
        totalAssists: typeof data.totalAssists === "string" ? parseInt(data.totalAssists, 10) || 0 : data.totalAssists || 0,
        totalMinutes: typeof data.totalMinutes === "string" ? parseInt(data.totalMinutes, 10) || 0 : data.totalMinutes || 0,
        marketValue: "marketValue" in data && data.marketValue && typeof data.marketValue === "string" ? parseFloat(data.marketValue) : "marketValue" in data ? data.marketValue : undefined,
      };

      if (isEditMode && player) {
        await updateMutation.mutateAsync({
          id: player.id,
          data: apiData as any, // Type will be validated by API
        });
      } else {
        await createMutation.mutateAsync(apiData as any);
      }
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // Error handling is done by mutation - error is displayed in UI
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const formError = createMutation.error || updateMutation.error;

  const addVideoLink = () => {
    const currentLinks = watchedVideoLinks || [];
    if (currentLinks.length < 15) {
      setValue("videoLinks", [...currentLinks, ""], { shouldValidate: true });
    }
  };

  const removeVideoLink = (index: number) => {
    const currentLinks = watchedVideoLinks || [];
    setValue(
      "videoLinks",
      currentLinks.filter((_, i) => i !== index),
      { shouldValidate: true }
    );
  };

  const updateVideoLink = (index: number, value: string) => {
    const currentLinks = watchedVideoLinks || [];
    const updatedLinks = [...currentLinks];
    updatedLinks[index] = value;
    setValue("videoLinks", updatedLinks, { shouldValidate: true });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Редактировать игрока" : "Создать игрока"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Измените данные игрока."
              : "Заполните форму для создания нового игрока."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                Имя <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                type="text"
                {...register("firstName")}
                placeholder="Иван"
                disabled={isLoading}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">
                  {errors.firstName.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Фамилия <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                type="text"
                {...register("lastName")}
                placeholder="Петров"
                disabled={isLoading}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">
                  {errors.lastName.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Позиция <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-2 rounded-md border p-3">
                {Object.entries(positionLabels).map(([value, label]) => {
                  const pos = value as Position;
                  const isChecked = (watchedPositions as Position[]).includes(pos);
                  return (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`position-${value}`}
                        checked={isChecked}
                        onCheckedChange={() => togglePosition(pos)}
                        disabled={isLoading}
                      />
                      <label
                        htmlFor={`position-${value}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {label}
                      </label>
                    </div>
                  );
                })}
              </div>
              {errors.position && (
                <p className="text-sm text-destructive">
                  {errors.position.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">
                Дата рождения <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...register("dateOfBirth")}
                disabled={isLoading}
                max={new Date().toISOString().split("T")[0]}
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-destructive">
                  {errors.dateOfBirth.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="teamId">Клуб/Команда</Label>
              <Select
                value={watch("teamId") || "__none__"}
                onValueChange={(value) => {
                  setValue("teamId", value === "__none__" ? "" : value, { shouldValidate: true });
                }}
                disabled={isLoading || (!isEditMode && !!initialTeamId)}
              >
                <SelectTrigger id="teamId">
                  <SelectValue placeholder="Выберите команду (опционально)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Без команды —</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.teamId && (
                <p className="text-sm text-destructive">
                  {errors.teamId.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Фото (URL)</Label>
              <Input
                id="image"
                type="url"
                {...register("image")}
                placeholder="https://example.com/photo.jpg"
                disabled={isLoading}
              />
              {"image" in errors && errors.image && (
                <p className="text-sm text-destructive">
                  {errors.image.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalMatches">Матчи</Label>
              <Input
                id="totalMatches"
                type="number"
                min="0"
                max="1000"
                {...register("totalMatches")}
                disabled={isLoading}
              />
              {errors.totalMatches && (
                <p className="text-sm text-destructive">
                  {errors.totalMatches.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalGoals">Голы</Label>
              <Input
                id="totalGoals"
                type="number"
                min="0"
                max="500"
                {...register("totalGoals")}
                disabled={isLoading}
              />
              {errors.totalGoals && (
                <p className="text-sm text-destructive">
                  {errors.totalGoals.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalAssists">Ассисты</Label>
              <Input
                id="totalAssists"
                type="number"
                min="0"
                max="500"
                {...register("totalAssists")}
                disabled={isLoading}
              />
              {errors.totalAssists && (
                <p className="text-sm text-destructive">
                  {errors.totalAssists.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalMinutes">Минуты</Label>
              <Input
                id="totalMinutes"
                type="number"
                min="0"
                max="100000"
                {...register("totalMinutes")}
                disabled={isLoading}
              />
              {errors.totalMinutes && (
                <p className="text-sm text-destructive">
                  {errors.totalMinutes.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Видео хайлайты</Label>
              {watchedVideoLinks.length < 15 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addVideoLink}
                  disabled={isLoading}
                >
                  Добавить ссылку
                </Button>
              )}
            </div>
            {watchedVideoLinks.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Нет видео-ссылок. Нажмите "Добавить ссылку", чтобы добавить.
              </p>
            )}
            {watchedVideoLinks.map((link, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  type="url"
                  value={link || ""}
                  onChange={(e) => updateVideoLink(index, e.target.value)}
                  placeholder="https://example.com/video"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeVideoLink(index)}
                  disabled={isLoading}
                >
                  ×
                </Button>
              </div>
            ))}
            {errors.videoLinks && (
              <p className="text-sm text-destructive">
                {errors.videoLinks.message as string}
              </p>
            )}
            {watchedVideoLinks.length >= 15 && (
              <p className="text-sm text-muted-foreground">
                Достигнут максимум (15 ссылок)
              </p>
            )}
          </div>

          {formError && (
            <div className="rounded-md bg-destructive/10 p-3">
              <p className="text-sm text-destructive">
                {formError instanceof Error
                  ? formError.message
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

