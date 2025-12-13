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
  createTournamentFormSchema,
  updateTournamentFormSchema,
} from "@/lib/validations/tournament";
import type {
  CreateTournamentFormInput,
  UpdateTournamentFormInput,
} from "@/lib/validations/tournament";
import type { Tournament } from "@/lib/types/tournaments";
import { useCreateTournament, useUpdateTournament } from "@/lib/hooks/use-admin-tournaments";
import { cn } from "@/lib/utils";

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

  const form = useForm<CreateTournamentFormInput | UpdateTournamentFormInput>({
    resolver: zodResolver(
      isEditMode ? updateTournamentFormSchema : createTournamentFormSchema
    ),
    defaultValues:
      isEditMode && tournament
        ? {
            name: tournament.name,
            description: tournament.description || "",
            season: tournament.season || "",
            location: tournament.location || "",
            logo: tournament.logo || "",
            startDate: tournament.startDate || "",
            endDate: tournament.endDate || "",
            isActive: tournament.isActive,
          }
        : {
            name: "",
            description: "",
            season: "",
            location: "",
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

  // Reset form when tournament changes (for edit mode)
  React.useEffect(() => {
    if (isEditMode && tournament) {
      reset({
        name: tournament.name,
        description: tournament.description || "",
        season: tournament.season || "",
        location: tournament.location || "",
        logo: tournament.logo || "",
        startDate: tournament.startDate || "",
        endDate: tournament.endDate || "",
        isActive: tournament.isActive,
      });
    } else {
      reset({
        name: "",
        description: "",
        season: "",
        location: "",
        logo: "",
        startDate: "",
        endDate: "",
        isActive: true,
      });
    }
  }, [tournament, isEditMode, reset]);

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (
    data: CreateTournamentFormInput | UpdateTournamentFormInput
  ) => {
    try {
      if (isEditMode && tournament) {
        await updateMutation.mutateAsync({
          id: tournament.id,
          data: {
            name: data.name,
            description: data.description || null,
            season: data.season || null,
            location: data.location || null,
            logo: data.logo || null,
            startDate: data.startDate || null,
            endDate: data.endDate || null,
            isActive: data.isActive,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: data.name!,
          description: data.description || null,
          season: data.season || null,
          location: data.location || null,
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
      // Error handling is done by mutation
    }
  };

  const isActive = watch("isActive");

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
              <Input
                id="season"
                type="text"
                {...register("season")}
                placeholder="2024/2025"
                disabled={isLoading}
              />
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
              Турнир активен
            </Label>
          </div>
          {errors.isActive && (
            <p className="text-sm text-destructive">
              {errors.isActive.message as string}
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
                : "Создать"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

