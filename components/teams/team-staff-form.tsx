"use client";

import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { TeamStaffMember } from "@/lib/types/teams";
import {
  useCreateTeamStaffMember,
  useUpdateTeamStaffMember,
} from "@/lib/hooks/use-admin-teams";

const staffFormSchema = z.object({
  fullName: z.string().min(1, "ФИО обязательно").max(200, "Слишком длинное ФИО"),
  roleTitle: z
    .string()
    .min(1, "Должность обязательна")
    .max(200, "Слишком длинная должность"),
  phone: z.string().max(50, "Телефон слишком длинный").optional(),
  email: z.string().email("Неверный email").max(200, "Email слишком длинный").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

type StaffFormInput = z.input<typeof staffFormSchema>;

interface TeamStaffFormProps {
  teamId: string;
  staff?: TeamStaffMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TeamStaffForm({
  teamId,
  staff,
  open,
  onOpenChange,
  onSuccess,
}: TeamStaffFormProps) {
  const isEditMode = !!staff;
  const createMutation = useCreateTeamStaffMember();
  const updateMutation = useUpdateTeamStaffMember();

  const form = useForm<StaffFormInput>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: staff
      ? {
          fullName: staff.fullName,
          roleTitle: staff.roleTitle,
          phone: staff.phone || "",
          email: staff.email || "",
          isActive: staff.isActive,
        }
      : {
          fullName: "",
          roleTitle: "",
          phone: "",
          email: "",
          isActive: true,
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

  React.useEffect(() => {
    if (staff) {
      reset({
        fullName: staff.fullName,
        roleTitle: staff.roleTitle,
        phone: staff.phone || "",
        email: staff.email || "",
        isActive: staff.isActive,
      });
    } else {
      reset({
        fullName: "",
        roleTitle: "",
        phone: "",
        email: "",
        isActive: true,
      });
    }
  }, [staff, reset]);

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending;
  const isActive = watch("isActive");
  const formError =
    createMutation.error ||
    updateMutation.error;

  const onSubmit = async (data: StaffFormInput) => {
    const payload = {
      fullName: data.fullName,
      roleTitle: data.roleTitle,
      phone: data.phone?.trim() ? data.phone.trim() : null,
      email: data.email?.trim() ? data.email.trim() : null,
      // Sort order is managed internally (form doesn't expose it for now)
      sortOrder: staff?.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    };

    const saved = isEditMode && staff
      ? await updateMutation.mutateAsync({
          teamId,
          staffId: staff.id,
          data: payload,
        })
      : await createMutation.mutateAsync({
          teamId,
          data: payload,
        });
    void saved;

    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Редактировать сотрудника" : "Добавить сотрудника"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Измените данные сотрудника тренерского штаба."
              : "Добавьте сотрудника тренерского штаба."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">
              ФИО <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              {...register("fullName")}
              placeholder="Иванов Иван Иванович"
              disabled={isLoading}
            />
            {errors.fullName && (
              <p className="text-sm text-destructive">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="roleTitle">
              Должность <span className="text-destructive">*</span>
            </Label>
            <Input
              id="roleTitle"
              {...register("roleTitle")}
              placeholder="Главный тренер"
              disabled={isLoading}
            />
            {errors.roleTitle && (
              <p className="text-sm text-destructive">
                {errors.roleTitle.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="+7 999 123-45-67"
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="coach@example.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) =>
                setValue("isActive", checked === true, {
                  shouldValidate: true,
                })
              }
              disabled={isLoading}
            />
            <Label htmlFor="isActive" className="cursor-pointer">
              Активен
            </Label>
          </div>

          {formError && (
            <div className="text-sm text-destructive">
              {formError instanceof Error ? formError.message : "Ошибка"}
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

