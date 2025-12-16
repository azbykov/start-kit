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
      <CardHeader className="pb-4">
        <CardTitle className="text-lg uppercase tracking-wide text-foreground/80">
          Общая информация
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6">
          {/* Photo */}
          <div className="flex-shrink-0">
            {player.image ? (
              <div className="relative h-28 w-28 rounded-lg overflow-hidden border border-border">
                <Image
                  src={player.image}
                  alt={`${player.firstName} ${player.lastName}`}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-28 w-28 rounded-lg border border-border bg-muted flex items-center justify-center">
                <User className="h-16 w-16 text-muted-foreground/50" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3 text-sm">
            <InfoRow label="Фамилия" value={player.lastName} />
            <InfoRow label="Имя" value={player.firstName} />
            <InfoRow
              label="Дата рождения"
              value={`${dateOfBirth.toLocaleDateString("ru-RU")} (${age} лет)`}
            />
            <InfoRow label="Страна рождения" value="Не указано" />
            <InfoRow label="Страна паспорта" value="Не указано" />

            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Рост" value="Не указано" />
              <InfoRow label="Вес" value="Не указано" />
            </div>

            <div className="pt-1">
              <span className="text-sm text-muted-foreground">Позиция:</span>
              <div className="mt-1">
                <PositionBadges positions={player.position as Position[]} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Контракт до" value="Не указано" />
              <InfoRow label="Агент игрока" value="Не указано" />
            </div>

            {player.team && (
              <div className="pt-2 flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Текущий клуб:</span>
                <TeamLink team={player.team} size="sm" />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <span className="text-sm text-muted-foreground">{label}:</span>{" "}
    <span className="font-medium text-foreground">{value}</span>
  </div>
);
