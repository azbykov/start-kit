"use client";

import type { PlayerProfile } from "@/lib/types/players";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatAge } from "@/lib/utils/player";
import Image from "next/image";
import { PositionBadges } from "./position-badge";
import { Position } from "@prisma/client";
import { User } from "lucide-react";
import { TeamLink } from "@/components/teams/team-link";

interface PlayerProfileProps {
  player: PlayerProfile;
}

export function PlayerProfileComponent({ player }: PlayerProfileProps) {
  const dateOfBirth = new Date(player.dateOfBirth);
  const age = formatAge(player.dateOfBirth);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">GENERAL INFO</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6">
          {/* Photo */}
          <div className="flex-shrink-0">
            {player.image ? (
              <div className="relative h-40 w-40 rounded-lg overflow-hidden border">
                <Image
                  src={player.image}
                  alt={`${player.firstName} ${player.lastName}`}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-40 w-40 rounded-lg border bg-muted flex items-center justify-center">
                <User className="h-20 w-20 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-2.5 text-sm">
            <div>
              <span className="text-muted-foreground">Фамилия: </span>
              <span className="font-medium">{player.lastName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Имя: </span>
              <span className="font-medium">{player.firstName}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Дата рождения: </span>
              <span>
                {dateOfBirth.toLocaleDateString("ru-RU", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}{" "}
                ({age})
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Страна рождения: </span>
              <span>Не указано</span>
            </div>
            <div>
              <span className="text-muted-foreground">Страна паспорта: </span>
              <span>Не указано</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <span className="text-muted-foreground">Рост: </span>
                <span>Не указано</span>
              </div>
              <div>
                <span className="text-muted-foreground">Вес: </span>
                <span>Не указано</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <span className="text-muted-foreground">Позиция: </span>
                <PositionBadges 
                  positions={player.position as Position[]} 
                />
              </div>
              {player.team && (
                <div>
                  <span className="text-muted-foreground">Текущий клуб: </span>
                  <TeamLink team={player.team} size="sm" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <span className="text-muted-foreground">Контракт до: </span>
                <span>Не указано</span>
              </div>
              <div>
                <span className="text-muted-foreground">Агент игрока: </span>
                <span>Не указано</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
