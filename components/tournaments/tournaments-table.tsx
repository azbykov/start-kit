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
import { Trophy } from "lucide-react";
import type { Tournament } from "@/lib/types/tournaments";
import { TournamentActions } from "./tournament-actions";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface TournamentsTableProps {
  data: Tournament[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  onEdit?: (tournament: Tournament) => void;
  onDelete?: (tournament: Tournament) => void;
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const createColumns = (
  router: ReturnType<typeof useRouter>,
  onEdit?: (tournament: Tournament) => void,
  onDelete?: (tournament: Tournament) => void
): ColumnDef<Tournament>[] => [
  {
    id: "tournament",
    header: "Турнир",
    cell: ({ row }) => {
      const tournament = row.original;
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={tournament.logo || undefined}
              alt={tournament.name}
            />
            <AvatarFallback className="bg-muted flex items-center justify-center">
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div
            className="cursor-pointer hover:underline text-xs font-medium"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/tournaments/${tournament.id}`);
            }}
          >
            {tournament.name}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "season",
    header: "Сезон",
    cell: ({ row }) => {
      const season = row.getValue("season") as string | null;
      return <div className="text-xs">{season || "—"}</div>;
    },
  },
  {
    accessorKey: "location",
    header: "Локация",
    cell: ({ row }) => {
      const location = row.getValue("location") as string | null;
      return <div className="text-xs">{location || "—"}</div>;
    },
  },
  {
    id: "dates",
    header: "Даты",
    cell: ({ row }) => {
      const tournament = row.original;
      const startDate = formatDate(tournament.startDate);
      const endDate = formatDate(tournament.endDate);
      return (
        <div className="text-xs">
          {startDate !== "—" && endDate !== "—" ? (
            <>{startDate} — {endDate}</>
          ) : startDate !== "—" ? (
            <>{startDate}</>
          ) : (
            "—"
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Статус",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
          {isActive ? "Активен" : "Неактивен"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Действия",
    cell: ({ row }) => {
      const tournament = row.original;
      return (
        <TournamentActions
          tournament={tournament}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );
    },
  },
];

export function TournamentsTable({
  data,
  pagination,
  onPageChange,
  isLoading = false,
  onEdit,
  onDelete,
}: TournamentsTableProps) {
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
        <div className="text-muted-foreground">Турниры не найдены</div>
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
                  Турниры не найдены
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

