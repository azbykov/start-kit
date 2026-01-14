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
            contactPhone: team.contactPhone || "",
            contactEmail: team.contactEmail || "",
            contactWebsite: team.contactWebsite || "",
            contactAddress: team.contactAddress || "",
            contactTelegram: team.contactTelegram || "",
            contactVk: team.contactVk || "",
            isActive: team.isActive,
          }
        : {
            name: "",
            logo: "",
            coach: "",
            city: "",
            country: "",
            contactPhone: "",
            contactEmail: "",
            contactWebsite: "",
            contactAddress: "",
            contactTelegram: "",
            contactVk: "",
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
        contactPhone: team.contactPhone || "",
        contactEmail: team.contactEmail || "",
        contactWebsite: team.contactWebsite || "",
        contactAddress: team.contactAddress || "",
        contactTelegram: team.contactTelegram || "",
        contactVk: team.contactVk || "",
        isActive: team.isActive,
      });
    } else {
      reset({
        name: "",
        logo: "",
        coach: "",
        city: "",
        country: "",
        contactPhone: "",
        contactEmail: "",
        contactWebsite: "",
        contactAddress: "",
        contactTelegram: "",
        contactVk: "",
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
            contactPhone: data.contactPhone || null,
            contactEmail: data.contactEmail || null,
            contactWebsite: data.contactWebsite || null,
            contactAddress: data.contactAddress || null,
            contactTelegram: data.contactTelegram || null,
            contactVk: data.contactVk || null,
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
          contactPhone: data.contactPhone || null,
          contactEmail: data.contactEmail || null,
          contactWebsite: data.contactWebsite || null,
          contactAddress: data.contactAddress || null,
          contactTelegram: data.contactTelegram || null,
          contactVk: data.contactVk || null,
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
            <Label htmlFor="coach">Главный тренер</Label>
            <Input
              id="coach"
              type="text"
              {...register("coach")}
              placeholder="Иванов Иван Иванович"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Будет автоматически добавлен в «Тренерский штаб» как «Главный тренер».
            </p>
            {errors.coach && (
              <p className="text-sm text-destructive">
                {errors.coach.message as string}
              </p>
            )}
          </div>

          <div className="pt-2">
            <div className="text-sm font-semibold mb-2">Контакты</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Телефон</Label>
                <Input
                  id="contactPhone"
                  type="text"
                  {...register("contactPhone")}
                  placeholder="+7 999 123-45-67"
                  disabled={isLoading}
                />
                {"contactPhone" in errors && errors.contactPhone && (
                  <p className="text-sm text-destructive">
                    {errors.contactPhone.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  {...register("contactEmail")}
                  placeholder="club@example.com"
                  disabled={isLoading}
                />
                {"contactEmail" in errors && errors.contactEmail && (
                  <p className="text-sm text-destructive">
                    {errors.contactEmail.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactWebsite">Сайт</Label>
                <Input
                  id="contactWebsite"
                  type="url"
                  {...register("contactWebsite")}
                  placeholder="https://example.com"
                  disabled={isLoading}
                />
                {"contactWebsite" in errors && errors.contactWebsite && (
                  <p className="text-sm text-destructive">
                    {errors.contactWebsite.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactTelegram">Telegram</Label>
                <Input
                  id="contactTelegram"
                  type="text"
                  {...register("contactTelegram")}
                  placeholder="@start_fc"
                  disabled={isLoading}
                />
                {"contactTelegram" in errors && errors.contactTelegram && (
                  <p className="text-sm text-destructive">
                    {errors.contactTelegram.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactVk">VK</Label>
                <Input
                  id="contactVk"
                  type="text"
                  {...register("contactVk")}
                  placeholder="https://vk.com/..."
                  disabled={isLoading}
                />
                {"contactVk" in errors && errors.contactVk && (
                  <p className="text-sm text-destructive">
                    {errors.contactVk.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="contactAddress">Адрес</Label>
                <Input
                  id="contactAddress"
                  type="text"
                  {...register("contactAddress")}
                  placeholder="Санкт-Петербург, ..."
                  disabled={isLoading}
                />
                {"contactAddress" in errors && errors.contactAddress && (
                  <p className="text-sm text-destructive">
                    {errors.contactAddress.message as string}
                  </p>
                )}
              </div>
            </div>
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

