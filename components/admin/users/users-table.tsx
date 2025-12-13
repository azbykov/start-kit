"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/types/admin-users";
import { Role } from "@prisma/client";
import { Pencil, Trash2, Key } from "lucide-react";

interface UsersTableProps {
  data: User[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onResetPassword?: (user: User) => void;
}

const roleLabels: Record<Role, string> = {
  PLAYER: "Игрок",
  COACH: "Тренер",
  AGENT: "Агент",
  ADMIN: "Администратор",
};

const createColumns = (
  onEdit?: (user: User) => void,
  onDelete?: (user: User) => void,
  onResetPassword?: (user: User) => void
): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: "Имя",
    cell: ({ row }) => {
      const name = row.getValue("name") as string | null;
      return <div>{name || "—"}</div>;
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Роль",
    cell: ({ row }) => {
      const role = row.getValue("role") as Role;
      return <div>{roleLabels[role] || role}</div>;
    },
  },
  {
    accessorKey: "isActive",
    header: "Статус",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <div className={isActive ? "text-green-600" : "text-red-600"}>
          {isActive ? "Активен" : "Заблокирован"}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Дата создания",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt") as string);
      return <div>{date.toLocaleDateString("ru-RU")}</div>;
    },
  },
  {
    id: "actions",
    header: "Действия",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(user)}
              title="Редактировать"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onResetPassword && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onResetPassword(user)}
              title="Сбросить пароль"
            >
              <Key className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(user)}
              title="Удалить"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];

export function UsersTable({
  data,
  pagination,
  onPageChange,
  isLoading = false,
  onEdit,
  onDelete,
  onResetPassword,
}: UsersTableProps) {
  const columns = createColumns(onEdit, onDelete, onResetPassword);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination.totalPages,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Пользователи не найдены</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex-1 overflow-auto rounded-md border bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Пользователи не найдены
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex shrink-0 items-center justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">
          Показано {((pagination.page - 1) * pagination.pageSize) + 1} -{" "}
          {Math.min(pagination.page * pagination.pageSize, pagination.total)} из{" "}
          {pagination.total}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            Назад
          </Button>
          <div className="text-sm">
            Страница {pagination.page} из {pagination.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Вперед
          </Button>
        </div>
      </div>
    </div>
  );
}

