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
import { createUserSchema, updateUserSchema } from "@/lib/validations/user";
import type { CreateUserInput, UpdateUserInput } from "@/lib/validations/user";
import type { User } from "@/lib/types/admin-users";
import { Role } from "@prisma/client";
import { useCreateUser, useUpdateUser } from "@/lib/hooks/use-admin-users";

interface UserFormProps {
  user?: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const roleLabels: Record<Role, string> = {
  PLAYER: "Игрок",
  COACH: "Тренер",
  AGENT: "Агент",
  ADMIN: "Администратор",
};

export function UserForm({
  user,
  open,
  onOpenChange,
  onSuccess,
}: UserFormProps) {
  const isEditMode = !!user;
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const form = useForm<CreateUserInput | UpdateUserInput>({
    resolver: zodResolver(isEditMode ? updateUserSchema : createUserSchema),
    defaultValues: isEditMode
      ? {
          name: user?.name || "",
          role: user?.role || Role.PLAYER,
          isActive: user?.isActive ?? true,
        }
      : {
          role: Role.PLAYER,
          isActive: true,
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

  // Reset form when user changes (for edit mode)
  React.useEffect(() => {
    if (isEditMode && user) {
      reset({
        name: user.name || "",
        role: user.role,
        isActive: user.isActive,
      });
    } else if (!isEditMode) {
      reset({
        role: Role.PLAYER,
        isActive: true,
      });
    }
  }, [user, isEditMode, reset]);

  const watchedRole = watch("role");
  const watchedIsActive = watch("isActive");

  const onSubmit = async (data: CreateUserInput | UpdateUserInput) => {
    try {
      if (isEditMode && user) {
        await updateMutation.mutateAsync({
          id: user.id,
          data: data as UpdateUserInput,
        });
      } else {
        await createMutation.mutateAsync(data as CreateUserInput);
      }
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      // Error handling is done by mutation
      console.error("Form submission error:", error);
    }
  };

  const isLoading =
    createMutation.isPending || updateMutation.isPending;

  const formError =
    createMutation.error || updateMutation.error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Редактировать пользователя" : "Создать пользователя"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Измените данные пользователя. Email нельзя изменить."
              : "Заполните форму для создания нового пользователя."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email" as any)}
                placeholder="user@example.com"
                disabled={isLoading}
              />
              {(errors as any).email && (
                <p className="text-sm text-destructive">
                  {(errors as any).email.message as string}
                </p>
              )}
            </div>
          )}

          {isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="email-disabled">Email</Label>
              <Input
                id="email-disabled"
                type="email"
                value={user.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email нельзя изменить
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Имя</Label>
            <Input
              id="name"
              type="text"
              {...register("name")}
              placeholder="Иван Иванов"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">
                {errors.name.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">
              Роль <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watchedRole}
              onValueChange={(value) => setValue("role", value as Role)}
              disabled={isLoading}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Выберите роль" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-sm text-destructive">
                {errors.role.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="isActive">Статус активности</Label>
            <Select
              value={watchedIsActive ? "true" : "false"}
              onValueChange={(value) =>
                setValue("isActive", value === "true")
              }
              disabled={isLoading}
            >
              <SelectTrigger id="isActive">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Активен</SelectItem>
                <SelectItem value="false">Заблокирован</SelectItem>
              </SelectContent>
            </Select>
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

