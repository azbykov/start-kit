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
import { User } from "lucide-react";
import type { Player } from "@/lib/types/players";
import { Position } from "@prisma/client";
import { PlayerActions } from "./player-actions";
import { useRouter } from "next/navigation";
import { formatDateOfBirthShort } from "@/lib/utils/player";
import { PositionBadges } from "./position-badge";

interface PlayersTableProps {
  data: Player[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  onEdit?: (player: Player) => void;
  onDelete?: (player: Player) => void;
}

const createColumns = (
  router: ReturnType<typeof useRouter>,
  onEdit?: (player: Player) => void,
  onDelete?: (player: Player) => void
): ColumnDef<Player>[] => [
  {
    id: "player",
    header: "Игрок",
    cell: ({ row }) => {
      const player = row.original;
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={player.image || undefined} alt={`${player.firstName} ${player.lastName}`} />
            <AvatarFallback className="bg-muted flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div
            className="cursor-pointer hover:underline text-xs"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/players/${player.id}`);
            }}
          >
            {player.firstName} {player.lastName}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "teamId",
    header: "Команда",
    cell: ({ row }) => {
      const player = row.original;
      const teamName = (player as any).teamName as string | null;
      const teamId = player.teamId;
      return (
        <div className="text-xs">
          {teamName || (teamId || "—")}
        </div>
      );
    },
  },
  {
    accessorKey: "position",
    header: "Позиция",
    cell: ({ row }) => {
      const positions = row.getValue("position") as Position | Position[];
      return <PositionBadges positions={positions} />;
    },
  },
  {
    accessorKey: "dateOfBirth",
    header: "Возраст",
    cell: ({ row }) => {
      const dateStr = row.getValue("dateOfBirth") as string;
      return <div className="text-xs">{formatDateOfBirthShort(dateStr)}</div>;
    },
  },
  {
    accessorKey: "totalMatches",
    header: "Матчи",
    cell: ({ row }) => {
      const matches = row.getValue("totalMatches") as number;
      return <div className="text-xs">{matches}</div>;
    },
  },
  {
    accessorKey: "totalMinutes",
    header: "Минуты",
    cell: ({ row }) => {
      const minutes = row.getValue("totalMinutes") as number;
      return <div className="text-xs">{minutes}</div>;
    },
  },
  {
    accessorKey: "totalGoals",
    header: "Голы",
    cell: ({ row }) => {
      const goals = row.getValue("totalGoals") as number;
      return <div className="text-xs">{goals}</div>;
    },
  },
  {
    id: "actions",
    header: "Действия",
    cell: ({ row }) => {
      const player = row.original;
      return (
        <PlayerActions
          player={player}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );
    },
  },
];

export function PlayersTable({
  data,
  pagination,
  onPageChange,
  isLoading = false,
  onEdit,
  onDelete,
}: PlayersTableProps) {
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
        <div className="text-muted-foreground">Игроки не найдены</div>
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
                  Игроки не найдены
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter className="bg-white">
            <TableRow className="bg-white">
              <TableCell colSpan={columns.length}>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Показано {((pagination.page - 1) * pagination.pageSize) + 1} -{" "}
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



