"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAllTeams } from "@/lib/hooks/use-teams";
import { useAllTournaments } from "@/lib/hooks/use-tournaments";
import { Position } from "@prisma/client";
import { positionLabels } from "@/lib/utils/player";
import { PositionBadges } from "@/components/players/position-badge";
import { ChevronDown } from "lucide-react";

export interface PlayersFiltersValue {
  q: string;
  teamId: string;
  tournamentId: string;
  positions: Position[];
  dateOfBirthFrom: string;
  dateOfBirthTo: string;
  ratingFrom: string;
  ratingTo: string;
  sort: "newest" | "name" | "rating_desc" | "rating_asc";
}

interface PlayersFiltersProps {
  value: PlayersFiltersValue;
  onChange: (next: PlayersFiltersValue) => void;
  onReset: () => void;
}

function PositionsMultiSelect({
  value,
  onChange,
}: {
  value: Position[];
  onChange: (next: Position[]) => void;
}) {
  const toggle = (pos: Position) => {
    if (value.includes(pos)) {
      onChange(value.filter((p) => p !== pos));
    } else {
      onChange([...value, pos]);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-between h-10"
        >
          <div className="flex flex-wrap gap-1 items-center">
            {value.length === 0 ? (
              <span className="text-muted-foreground">Все амплуа</span>
            ) : (
              <PositionBadges positions={value} />
            )}
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
        <DropdownMenuLabel>Амплуа</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.values(Position).map((pos) => (
          <DropdownMenuCheckboxItem
            key={pos}
            checked={value.includes(pos)}
            onCheckedChange={() => toggle(pos)}
            onSelect={(e) => e.preventDefault()}
          >
            {positionLabels[pos]}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            onChange([]);
          }}
        >
          Очистить
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function PlayersFilters({ value, onChange, onReset }: PlayersFiltersProps) {
  const { data: teams } = useAllTeams();
  const { data: tournaments } = useAllTournaments();

  return (
    <div className="rounded-lg border bg-white p-4 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="q">Поиск (ФИО)</Label>
          <Input
            id="q"
            value={value.q}
            onChange={(e) => onChange({ ...value, q: e.target.value })}
            placeholder="Иванов Иван"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="teamId">Команда</Label>
          <Select
            value={value.teamId || "__all__"}
            onValueChange={(v) =>
              onChange({ ...value, teamId: v === "__all__" ? "" : v })
            }
          >
            <SelectTrigger id="teamId">
              <SelectValue placeholder="Все команды" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Все команды</SelectItem>
              {(teams || []).map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tournamentId">Турнир</Label>
          <Select
            value={value.tournamentId || "__all__"}
            onValueChange={(v) =>
              onChange({ ...value, tournamentId: v === "__all__" ? "" : v })
            }
          >
            <SelectTrigger id="tournamentId">
              <SelectValue placeholder="Все турниры" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Все турниры</SelectItem>
              {(tournaments || []).map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Амплуа</Label>
          <PositionsMultiSelect
            value={value.positions}
            onChange={(next) => onChange({ ...value, positions: next })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dobFrom">Дата рождения от</Label>
          <Input
            id="dobFrom"
            type="date"
            value={value.dateOfBirthFrom}
            onChange={(e) =>
              onChange({ ...value, dateOfBirthFrom: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dobTo">Дата рождения до</Label>
          <Input
            id="dobTo"
            type="date"
            value={value.dateOfBirthTo}
            onChange={(e) =>
              onChange({ ...value, dateOfBirthTo: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Рейтинг</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min="0"
              max="100"
              value={value.ratingFrom}
              onChange={(e) => onChange({ ...value, ratingFrom: e.target.value })}
              placeholder="от"
            />
            <Input
              type="number"
              min="0"
              max="100"
              value={value.ratingTo}
              onChange={(e) => onChange({ ...value, ratingTo: e.target.value })}
              placeholder="до"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sort">Сортировка</Label>
          <Select
            value={value.sort}
            onValueChange={(v) =>
              onChange({ ...value, sort: v as PlayersFiltersValue["sort"] })
            }
          >
            <SelectTrigger id="sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Сначала новые</SelectItem>
              <SelectItem value="name">По фамилии</SelectItem>
              <SelectItem value="rating_desc">Рейтинг (убыв.)</SelectItem>
              <SelectItem value="rating_asc">Рейтинг (возр.)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={onReset}>
          Сбросить
        </Button>
      </div>
    </div>
  );
}

