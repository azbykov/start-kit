"use client";

import * as React from "react";
import type { TeamStaffMember } from "@/lib/types/teams";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { TeamStaffForm } from "@/components/teams/team-staff-form";
import { useDeleteTeamStaffMember } from "@/lib/hooks/use-admin-teams";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface TeamStaffProps {
  teamId: string;
  staff: TeamStaffMember[];
  isLoading?: boolean;
  canManage?: boolean;
}

export function TeamStaff({
  teamId,
  staff,
  isLoading = false,
  canManage = false,
}: TeamStaffProps) {
  const deleteMutation = useDeleteTeamStaffMember();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<TeamStaffMember | null>(null);

  const sorted = [...staff].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.fullName.localeCompare(b.fullName, "ru-RU");
  });

  const visibleBase = canManage ? sorted : sorted.filter((s) => s.isActive);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base font-semibold">
            Тренерский штаб
          </CardTitle>
          {canManage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Добавить
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              Загрузка...
            </div>
          ) : visibleBase.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              Сотрудников пока нет
            </div>
          ) : (
            <div className="space-y-2">
              {visibleBase.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 rounded-md border p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarImage
                          src={m.photoUrl || undefined}
                          alt={m.fullName}
                        />
                        <AvatarFallback className="text-xs">
                          {m.fullName.substring(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={
                          m.isActive
                            ? "text-sm font-medium"
                            : "text-sm font-medium text-muted-foreground line-through"
                        }
                      >
                        {m.fullName}
                      </div>
                      {!m.isActive && canManage && (
                        <Badge variant="secondary" className="text-xs">
                          Неактивен
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {m.roleTitle}
                      {m.phone ? ` • ${m.phone}` : ""}
                      {m.email ? ` • ${m.email}` : ""}
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => {
                          setEditing(m);
                          setFormOpen(true);
                        }}
                        title="Редактировать"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        disabled={deleteMutation.isPending}
                        onClick={() => {
                          const ok = window.confirm(
                            "Удалить сотрудника тренерского штаба?"
                          );
                          if (!ok) return;
                          deleteMutation.mutate({ teamId, staffId: m.id });
                        }}
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}

              {deleteMutation.error && (
                <div className="text-sm text-destructive">
                  {deleteMutation.error instanceof Error
                    ? deleteMutation.error.message
                    : "Ошибка при удалении"}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {canManage && (
        <TeamStaffForm
          teamId={teamId}
          staff={editing}
          open={formOpen}
          onOpenChange={(open) => {
            setFormOpen(open);
            if (!open) setEditing(null);
          }}
        />
      )}
    </>
  );
}

