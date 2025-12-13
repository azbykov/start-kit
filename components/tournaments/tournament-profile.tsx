"use client";

import type { TournamentProfile } from "@/lib/types/tournaments";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Trophy, Pencil, Plus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TournamentProfileProps {
  tournament: TournamentProfile;
  isAdmin?: boolean;
  onEdit?: () => void;
  onAddMatch?: () => void;
  onAddTeam?: () => void;
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export function TournamentProfileComponent({
  tournament,
  isAdmin = false,
  onEdit,
  onAddMatch,
  onAddTeam,
}: TournamentProfileProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-base font-semibold">О турнире</CardTitle>
          {isAdmin && (
            <div className="flex items-center gap-2">
              {onAddTeam && (
                <Button variant="outline" size="sm" onClick={onAddTeam}>
                  <Users className="h-4 w-4 mr-2" />
                  Добавить команду
                </Button>
              )}
              {onAddMatch && (
                <Button variant="outline" size="sm" onClick={onAddMatch}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить матч
                </Button>
              )}
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            {/* Logo */}
            <div className="flex-shrink-0">
              {tournament.logo ? (
                <div className="relative h-40 w-40 rounded-lg overflow-hidden border">
                  <Image
                    src={tournament.logo}
                    alt={tournament.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-40 w-40 rounded-lg border bg-muted flex items-center justify-center">
                  <Trophy className="h-20 w-20 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2.5 text-sm">
              <div>
                <span className="text-muted-foreground">Название: </span>
                <span className="font-medium text-base">{tournament.name}</span>
              </div>
              {tournament.season && (
                <div>
                  <span className="text-muted-foreground">Сезон: </span>
                  <span className="font-medium">{tournament.season}</span>
                </div>
              )}
              {tournament.location && (
                <div>
                  <span className="text-muted-foreground">Локация: </span>
                  <span className="font-medium">{tournament.location}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                {tournament.startDate && (
                  <div>
                    <span className="text-muted-foreground">Дата начала: </span>
                    <span>{formatDate(tournament.startDate)}</span>
                  </div>
                )}
                {tournament.endDate && (
                  <div>
                    <span className="text-muted-foreground">
                      Дата окончания:{" "}
                    </span>
                    <span>{formatDate(tournament.endDate)}</span>
                  </div>
                )}
              </div>
              <div className="mt-3">
                <span className="text-muted-foreground">Статус: </span>
                <Badge
                  variant={tournament.isActive ? "default" : "secondary"}
                  className="ml-2"
                >
                  {tournament.isActive ? "Активен" : "Неактивен"}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {tournament.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Описание</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm whitespace-pre-wrap text-muted-foreground">
              {tournament.description}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

