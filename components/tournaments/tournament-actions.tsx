"use client";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { Tournament } from "@/lib/types/tournaments";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";

interface TournamentActionsProps {
  tournament: Tournament;
  onEdit?: (tournament: Tournament) => void;
  onDelete?: (tournament: Tournament) => void;
}

export function TournamentActions({
  tournament,
  onEdit,
  onDelete,
}: TournamentActionsProps) {
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
          onClick={() => onEdit(tournament)}
          title="Редактировать"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(tournament)}
          title="Удалить"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

