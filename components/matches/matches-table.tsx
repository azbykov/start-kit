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
import { Calendar, Clock } from "lucide-react";
import type { Match } from "@/lib/types/matches";
import { MatchActions } from "./match-actions";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface MatchesTableProps {
  data: Match[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  onEdit?: (match: Match) => void;
  onDelete?: (match: Match) => void;
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getStatusBadge = (status: string) => {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    SCHEDULED: "outline",
    LIVE: "default",
    FINISHED: "secondary",
    CANCELLED: "destructive",
  };
  const labels: Record<string, string> = {
    SCHEDULED: "Запланирован",
    LIVE: "В эфире",
    FINISHED: "Завершен",
    CANCELLED: "Отменен",
  };
  return (
    <Badge variant={variants[status] || "secondary"} className="text-xs">
      {labels[status] || status}
    </Badge>
  );
};

const createColumns = (
  _router: ReturnType<typeof useRouter>,
  onEdit?: (match: Match) => void,
  onDelete?: (match: Match) => void
): ColumnDef<Match>[] => [
  {
    id: "date",
    header: "Дата",
    cell: ({ row }) => {
      const match = row.original;
      return (
        <div className="text-xs">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            {formatDate(match.date)}
          </div>
          {match.time && (
            <div className="flex items-center gap-1 text-muted-foreground mt-1">
              <Clock className="h-3 w-3" />
              {match.time}
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "teams",
    header: "Команды",
    cell: ({ row }) => {
      const match = row.original;
      return (
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Avatar className="h-6 w-6">
              <AvatarImage src={match.homeTeamLogo || undefined} alt={match.homeTeamName} />
              <AvatarFallback className="bg-muted text-xs">
                {match.homeTeamName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{match.homeTeamName}</span>
          </div>
          <span className="text-muted-foreground">—</span>
          <div className="flex items-center gap-1">
            <Avatar className="h-6 w-6">
              <AvatarImage src={match.awayTeamLogo || undefined} alt={match.awayTeamName} />
              <AvatarFallback className="bg-muted text-xs">
                {match.awayTeamName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{match.awayTeamName}</span>
          </div>
        </div>
      );
    },
  },
  {
    id: "score",
    header: "Счет",
    cell: ({ row }) => {
      const match = row.original;
      return (
        <div className="text-xs font-semibold">
          {match.homeScore ?? 0} : {match.awayScore ?? 0}
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Статус",
    cell: ({ row }) => {
      return getStatusBadge(row.original.status);
    },
  },
  {
    id: "tournament",
    header: "Турнир",
    cell: ({ row }) => {
      const tournamentName = row.original.tournamentName;
      const tournamentShortName = row.original.tournamentShortName;
      return (
        <div className="text-xs text-muted-foreground" title={tournamentName || undefined}>
          {tournamentShortName || tournamentName || "—"}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Действия",
    cell: ({ row }) => {
      const match = row.original;
      return (
        <MatchActions
          match={match}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );
    },
  },
];

export function MatchesTable({
  data,
  pagination,
  onPageChange,
  isLoading = false,
  onEdit,
  onDelete,
}: MatchesTableProps) {
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
        <div className="text-muted-foreground">Матчи не найдены</div>
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
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => router.push(`/matches/${row.original.id}`)}
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
                  Матчи не найдены
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


