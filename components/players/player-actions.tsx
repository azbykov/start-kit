"use client";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { Player } from "@/lib/types/players";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";

interface PlayerActionsProps {
  player: Player;
  onEdit?: (player: Player) => void;
  onDelete?: (player: Player) => void;
}

export function PlayerActions({
  player,
  onEdit,
  onDelete,
}: PlayerActionsProps) {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === Role.ADMIN;

  if (!isAdmin) {
    return null; // No actions for non-admin users
  }

  return (
    <div className="flex items-center gap-2">
      {onEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(player)}
          title="Редактировать"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(player)}
          title="Удалить"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}



