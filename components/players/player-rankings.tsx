"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePlayersRanking } from "@/lib/hooks/use-players";
import { useAllTeams } from "@/lib/hooks/use-teams";
import { useAllTournaments } from "@/lib/hooks/use-tournaments";
import { Position } from "@prisma/client";
import { positionLabels } from "@/lib/utils/player";
import { PlayersTable } from "@/components/players/players-table";

type Tab = "all" | "tournament" | "team" | "age" | "position";

export function PlayerRankings() {
  const [tab, setTab] = React.useState<Tab>("all");

  const { data: teams } = useAllTeams();
  const { data: tournaments } = useAllTournaments();

  const [teamId, setTeamId] = React.useState("");
  const [tournamentId, setTournamentId] = React.useState("");
  const [position, setPosition] = React.useState("");
  const [ageFrom, setAgeFrom] = React.useState("");
  const [ageTo, setAgeTo] = React.useState("");
  const [limit, setLimit] = React.useState("50");

  const rankingQuery = React.useMemo(() => {
    const base = { scope: tab, limit: Number(limit) || 50 } as any;
    if (tab === "team") base.teamId = teamId;
    if (tab === "tournament") base.tournamentId = tournamentId;
    if (tab === "position") base.position = position as Position;
    if (tab === "age") {
      base.ageFrom = ageFrom ? Number(ageFrom) : undefined;
      base.ageTo = ageTo ? Number(ageTo) : undefined;
    }
    return base;
  }, [tab, teamId, tournamentId, position, ageFrom, ageTo, limit]);

  const { data, isLoading, error } = usePlayersRanking(rankingQuery);
  const isReady =
    tab === "all" ||
    (tab === "team" && !!teamId) ||
    (tab === "tournament" && !!tournamentId) ||
    (tab === "position" && !!position) ||
    (tab === "age" && (!!ageFrom || !!ageTo));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Рейтинг игроков</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="all">Все</TabsTrigger>
            <TabsTrigger value="tournament">По турниру</TabsTrigger>
            <TabsTrigger value="team">По команде</TabsTrigger>
            <TabsTrigger value="age">По возрасту</TabsTrigger>
            <TabsTrigger value="position">По амплуа</TabsTrigger>
          </TabsList>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="limit">Лимит</Label>
              <Input
                id="limit"
                type="number"
                min="1"
                max="200"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              />
            </div>

            <TabsContent value="team" className="m-0">
              <div className="space-y-2">
                <Label htmlFor="teamId">Команда</Label>
                <Select value={teamId || "__none__"} onValueChange={(v) => setTeamId(v === "__none__" ? "" : v)}>
                  <SelectTrigger id="teamId">
                    <SelectValue placeholder="Выберите команду" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">—</SelectItem>
                    {(teams || []).map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="tournament" className="m-0">
              <div className="space-y-2">
                <Label htmlFor="tournamentId">Турнир</Label>
                <Select value={tournamentId || "__none__"} onValueChange={(v) => setTournamentId(v === "__none__" ? "" : v)}>
                  <SelectTrigger id="tournamentId">
                    <SelectValue placeholder="Выберите турнир" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">—</SelectItem>
                    {(tournaments || []).map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="position" className="m-0">
              <div className="space-y-2">
                <Label htmlFor="position">Амплуа</Label>
                <Select value={position || "__none__"} onValueChange={(v) => setPosition(v === "__none__" ? "" : v)}>
                  <SelectTrigger id="position">
                    <SelectValue placeholder="Выберите амплуа" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">—</SelectItem>
                    {Object.values(Position).map((p) => (
                      <SelectItem key={p} value={p}>
                        {positionLabels[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="age" className="m-0">
              <div className="space-y-2">
                <Label>Возраст</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="99"
                    value={ageFrom}
                    onChange={(e) => setAgeFrom(e.target.value)}
                    placeholder="от"
                  />
                  <Input
                    type="number"
                    min="0"
                    max="99"
                    value={ageTo}
                    onChange={(e) => setAgeTo(e.target.value)}
                    placeholder="до"
                  />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {!isReady ? (
          <div className="text-sm text-muted-foreground">
            Выберите параметры для построения рейтинга.
          </div>
        ) : error ? (
          <div className="text-destructive text-sm">
            Ошибка загрузки рейтинга. Проверьте выбранные параметры.
          </div>
        ) : (
          <PlayersTable
            data={(data?.players as any) || []}
            pagination={{
              page: 1,
              pageSize: data?.players?.length || 0,
              total: data?.players?.length || 0,
              totalPages: 1,
            }}
            onPageChange={() => {}}
            isLoading={isLoading}
          />
        )}
      </CardContent>
    </Card>
  );
}

