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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import type { Team } from "@/lib/types/teams";
import { TeamActions } from "./team-actions";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface TeamsTableProps {
  data: Team[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  onEdit?: (team: Team) => void;
  onDelete?: (team: Team) => void;
}

const createColumns = (
  router: ReturnType<typeof useRouter>,
  onEdit?: (team: Team) => void,
  onDelete?: (team: Team) => void
): ColumnDef<Team>[] => [
  {
    id: "team",
    header: "Команда",
    cell: ({ row }) => {
      const team = row.original;
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={team.logo || undefined} alt={team.name} />
            <AvatarFallback className="bg-muted flex items-center justify-center">
              <Users className="h-4 w-4 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div
            className="cursor-pointer hover:underline text-xs font-medium"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/teams/${team.id}`);
            }}
          >
            {team.name}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "city",
    header: "Город",
    cell: ({ row }) => {
      const city = row.getValue("city") as string | null;
      return <div className="text-xs">{city || "—"}</div>;
    },
  },
  {
    accessorKey: "country",
    header: "Страна",
    cell: ({ row }) => {
      const country = row.getValue("country") as string | null;
      return <div className="text-xs">{country || "—"}</div>;
    },
  },
  {
    accessorKey: "coach",
    header: "Тренер",
    cell: ({ row }) => {
      const coach = row.getValue("coach") as string | null;
      return <div className="text-xs">{coach || "—"}</div>;
    },
  },
  {
    accessorKey: "playersCount",
    header: "Игроки",
    cell: ({ row }) => {
      const team = row.original;
      const count = (team as any).playersCount as number | undefined;
      return <div className="text-xs">{count ?? 0}</div>;
    },
  },
  {
    accessorKey: "isActive",
    header: "Статус",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
          {isActive ? "Активна" : "Неактивна"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Действия",
    cell: ({ row }) => {
      const team = row.original;
      return (
        <TeamActions
          team={team}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );
    },
  },
];

export function TeamsTable({
  data,
  pagination,
  onPageChange,
  isLoading = false,
  onEdit,
  onDelete,
}: TeamsTableProps) {
  const router = useRouter();
  const columns = createColumns(router, onEdit, onDelete);

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
        <div className="text-muted-foreground">Команды не найдены</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col space-y-4">
      <div className="flex-1 overflow-auto rounded-md border bg-white">
        <Table className="text-xs">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="font-normal">
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
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Команды не найдены
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter className="bg-white">
            <TableRow className="bg-white">
              <TableCell colSpan={columns.length}>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Показано{" "}
                    {(pagination.page - 1) * pagination.pageSize + 1} -{" "}
                    {Math.min(
                      pagination.page * pagination.pageSize,
                      pagination.total
                    )}{" "}
                    из {pagination.total}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="h-7 text-xs"
                    >
                      Назад
                    </Button>
                    <div className="text-xs">
                      Страница {pagination.page} из {pagination.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className="h-7 text-xs"
                    >
                      Вперед
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}

