"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { Match } from "@/lib/types/matches";
import { useSession } from "next-auth/react";
import { Role } from "@prisma/client";

interface MatchActionsProps {
  match: Match;
  onEdit?: (match: Match) => void;
  onDelete?: (match: Match) => void;
}

export function MatchActions({
  match,
  onEdit,
  onDelete,
}: MatchActionsProps) {
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
          onClick={() => onEdit(match)}
          title="Редактировать"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(match)}
          title="Удалить"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}













