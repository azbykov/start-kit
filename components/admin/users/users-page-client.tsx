"use client";

import { useState, useEffect } from "react";
import { useUsers } from "@/lib/hooks/use-admin-users";
import { UsersTable } from "./users-table";
import { UserForm } from "./user-form";
import { DeleteUserDialog } from "./delete-user-dialog";
import { ResetPasswordDialog } from "./reset-password-dialog";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/types/admin-users";
import { usePageTitle } from "@/components/layout/page-title-context";

export function UsersPageClient() {
  const { setTitle } = usePageTitle();

  useEffect(() => {
    setTitle("Управление пользователями");
    return () => setTitle(undefined);
  }, [setTitle]);
  const [page, setPage] = useState(1);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);
  const pageSize = 25;

  const { data, isLoading, error, refetch } = useUsers({ page, pageSize });

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-destructive">
          Ошибка загрузки пользователей. Попробуйте обновить страницу.
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex justify-end">
        <Button onClick={() => setCreateDialogOpen(true)}>
          Создать пользователя
        </Button>
      </div>
      <div className="flex-1 overflow-auto">
        <UsersTable
        data={data?.users || []}
        pagination={
          data?.pagination || {
            page,
            pageSize,
            total: 0,
            totalPages: 0,
          }
        }
        onPageChange={setPage}
        isLoading={isLoading}
        onEdit={(user) => setEditUser(user)}
        onDelete={(user) => setDeleteUser(user)}
        onResetPassword={(user) => setResetPasswordUser(user)}
      />
      </div>
      <UserForm
        user={null}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          refetch();
        }}
      />
      <UserForm
        user={editUser}
        open={!!editUser}
        onOpenChange={(open) => {
          if (!open) setEditUser(null);
        }}
        onSuccess={() => {
          refetch();
          setEditUser(null);
        }}
      />
      <DeleteUserDialog
        user={deleteUser}
        open={!!deleteUser}
        onOpenChange={(open) => {
          if (!open) setDeleteUser(null);
        }}
        onSuccess={() => {
          refetch();
          setDeleteUser(null);
        }}
      />
      <ResetPasswordDialog
        user={resetPasswordUser}
        open={!!resetPasswordUser}
        onOpenChange={(open) => {
          if (!open) setResetPasswordUser(null);
        }}
        onSuccess={() => {
          setResetPasswordUser(null);
        }}
      />
    </div>
  );
}

