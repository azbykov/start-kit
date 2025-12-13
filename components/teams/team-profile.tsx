"use client";

import type { TeamProfile } from "@/lib/types/teams";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Users, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TeamProfileProps {
  team: TeamProfile;
  isEditable?: boolean;
  onEdit?: () => void;
}

export function TeamProfileComponent({
  team,
  isEditable = false,
  onEdit,
}: TeamProfileProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">О команде</CardTitle>
          {isEditable && onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="h-8"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Редактировать
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            {team.logo ? (
              <div className="relative h-40 w-40 rounded-lg overflow-hidden border">
                <Image
                  src={team.logo}
                  alt={team.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-40 w-40 rounded-lg border bg-muted flex items-center justify-center">
                <Users className="h-20 w-20 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-2.5 text-sm">
            <div>
              <span className="text-muted-foreground">Название: </span>
              <span className="font-medium text-base">{team.name}</span>
            </div>
            {team.city && (
              <div>
                <span className="text-muted-foreground">Город: </span>
                <span className="font-medium">{team.city}</span>
              </div>
            )}
            {team.country && (
              <div>
                <span className="text-muted-foreground">Страна: </span>
                <span className="font-medium">{team.country}</span>
              </div>
            )}
            {team.coach && (
              <div>
                <span className="text-muted-foreground">Тренер: </span>
                <span className="font-medium">{team.coach}</span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {team.playersCount !== undefined && (
                <div>
                  <span className="text-muted-foreground">Игроков в команде: </span>
                  <span>{team.playersCount}</span>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Статус: </span>
                <Badge
                  variant={team.isActive ? "default" : "secondary"}
                  className="ml-2"
                >
                  {team.isActive ? "Активна" : "Неактивна"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

