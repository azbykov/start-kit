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
  createTeamFormSchema,
  updateTeamFormSchema,
} from "@/lib/validations/team";
import type {
  CreateTeamFormInput,
  UpdateTeamFormInput,
} from "@/lib/validations/team";
import type { Team } from "@/lib/types/teams";
import { useCreateTeam, useUpdateTeam } from "@/lib/hooks/use-admin-teams";

interface TeamFormProps {
  team?: Team | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TeamForm({
  team,
  open,
  onOpenChange,
  onSuccess,
}: TeamFormProps) {
  const isEditMode = !!team;
  const createMutation = useCreateTeam();
  const updateMutation = useUpdateTeam();

  const form = useForm<CreateTeamFormInput | UpdateTeamFormInput>({
    resolver: zodResolver(
      isEditMode ? updateTeamFormSchema : createTeamFormSchema
    ),
    defaultValues:
      isEditMode && team
        ? {
            name: team.name,
            logo: team.logo || "",
            coach: team.coach || "",
            city: team.city || "",
            country: team.country || "",
            isActive: team.isActive,
          }
        : {
            name: "",
            logo: "",
            coach: "",
            city: "",
            country: "",
            isActive: true,
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

  // Reset form when team changes (for edit mode)
  React.useEffect(() => {
    if (isEditMode && team) {
      reset({
        name: team.name,
        logo: team.logo || "",
        coach: team.coach || "",
        city: team.city || "",
        country: team.country || "",
        isActive: team.isActive,
      });
    } else {
      reset({
        name: "",
        logo: "",
        coach: "",
        city: "",
        country: "",
        isActive: true,
      });
    }
  }, [team, isEditMode, reset]);

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (
    data: CreateTeamFormInput | UpdateTeamFormInput
  ) => {
    try {
      if (isEditMode && team) {
        await updateMutation.mutateAsync({
          id: team.id,
          data: {
            name: data.name,
            logo: data.logo || null,
            coach: data.coach || null,
            city: data.city || null,
            country: data.country || null,
            isActive: data.isActive,
          },
        });
      } else {
        await createMutation.mutateAsync({
          name: data.name!,
          logo: data.logo || null,
          coach: data.coach || null,
          city: data.city || null,
          country: data.country || null,
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
            {isEditMode ? "Редактировать команду" : "Создать команду"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Измените данные команды."
              : "Заполните форму для создания новой команды."}
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
              placeholder="ФК Старт"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">
                {errors.name.message as string}
              </p>
            )}
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
              <Label htmlFor="city">Город</Label>
              <Input
                id="city"
                type="text"
                {...register("city")}
                placeholder="Москва"
                disabled={isLoading}
              />
              {errors.city && (
                <p className="text-sm text-destructive">
                  {errors.city.message as string}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Страна</Label>
              <Input
                id="country"
                type="text"
                {...register("country")}
                placeholder="Россия"
                disabled={isLoading}
              />
              {errors.country && (
                <p className="text-sm text-destructive">
                  {errors.country.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coach">Тренер</Label>
            <Input
              id="coach"
              type="text"
              {...register("coach")}
              placeholder="Иванов Иван Иванович"
              disabled={isLoading}
            />
            {errors.coach && (
              <p className="text-sm text-destructive">
                {errors.coach.message as string}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => {
                setValue("isActive", checked === true, {
                  shouldValidate: true,
                });
              }}
              disabled={isLoading}
            />
            <Label
              htmlFor="isActive"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Команда активна
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

