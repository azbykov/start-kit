"use client";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { Team } from "@/lib/types/teams";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";

interface TeamActionsProps {
  team: Team;
  onEdit?: (team: Team) => void;
  onDelete?: (team: Team) => void;
}

export function TeamActions({
  team,
  onEdit,
  onDelete,
}: TeamActionsProps) {
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
          onClick={() => onEdit(team)}
          title="Редактировать"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(team)}
          title="Удалить"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

