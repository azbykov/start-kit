"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PlayerMatchStatsResponse } from "@/lib/types/players";

interface PlayerMatchStatsTablesProps {
  data: PlayerMatchStatsResponse;
}

export function PlayerMatchStatsTables({
  data,
}: PlayerMatchStatsTablesProps) {
  const { statisticsByPeriod } = data;
  const stats1H = statisticsByPeriod["1H"];
  const stats2H = statisticsByPeriod["2H"];
  const statsTotal = statisticsByPeriod.total;

  return (
    <div className="space-y-4">
      {/* Table 1: Actions/Successful */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Действия / Успешные
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Действие</TableHead>
                  <TableHead className="text-xs text-right">1-й тайм</TableHead>
                  <TableHead className="text-xs text-right">2-й тайм</TableHead>
                  <TableHead className="text-xs text-right">Матч</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-xs">Удары / В створ</TableCell>
                  <TableCell className="text-xs text-right">
                    {stats1H.shots} / {stats1H.shotsOnTarget}
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {stats2H.shots} / {stats2H.shotsOnTarget}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold">
                    {statsTotal.shots} / {statsTotal.shotsOnTarget}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs">Удары из штрафной</TableCell>
                  <TableCell className="text-xs text-right">
                    {stats1H.shotsFromBox}
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {stats2H.shotsFromBox}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold">
                    {statsTotal.shotsFromBox}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs">Удары из-за штрафной</TableCell>
                  <TableCell className="text-xs text-right">
                    {stats1H.shotsFromOutside}
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {stats2H.shotsFromOutside}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold">
                    {statsTotal.shotsFromOutside}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs">Передачи / Успешные</TableCell>
                  <TableCell className="text-xs text-right">
                    {stats1H.passes} / {stats1H.successfulPasses}
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {stats2H.passes} / {stats2H.successfulPasses}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold">
                    {statsTotal.passes} / {statsTotal.successfulPasses}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs">Кроссы</TableCell>
                  <TableCell className="text-xs text-right">
                    {stats1H.crosses}
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {stats2H.crosses}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold">
                    {statsTotal.crosses}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs">Передачи вперед</TableCell>
                  <TableCell className="text-xs text-right">
                    {stats1H.forwardPasses}
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {stats2H.forwardPasses}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold">
                    {statsTotal.forwardPasses}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs">Передачи назад</TableCell>
                  <TableCell className="text-xs text-right">
                    {stats1H.backwardPasses}
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {stats2H.backwardPasses}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold">
                    {statsTotal.backwardPasses}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Table 2: Main Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Основные метрики
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Метрика</TableHead>
                  <TableHead className="text-xs text-right">1-й тайм</TableHead>
                  <TableHead className="text-xs text-right">2-й тайм</TableHead>
                  <TableHead className="text-xs text-right">Матч</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-xs">Игровое время (мин)</TableCell>
                  <TableCell className="text-xs text-right">
                    {data.playerStats.minutesPlayed > 0
                      ? Math.floor(data.playerStats.minutesPlayed / 2)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {data.playerStats.minutesPlayed > 0
                      ? Math.ceil(data.playerStats.minutesPlayed / 2)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold">
                    {data.playerStats.minutesPlayed || "—"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs">Голы</TableCell>
                  <TableCell className="text-xs text-right">
                    {stats1H.goals}
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {stats2H.goals}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold">
                    {statsTotal.goals}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs">Ассисты</TableCell>
                  <TableCell className="text-xs text-right">
                    {stats1H.assists}
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {stats2H.assists}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold">
                    {statsTotal.assists}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs">Фолы / Фолы заработанные</TableCell>
                  <TableCell className="text-xs text-right">
                    {stats1H.fouls} / {stats1H.foulsSuffered}
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {stats2H.fouls} / {stats2H.foulsSuffered}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold">
                    {statsTotal.fouls} / {statsTotal.foulsSuffered}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs">Желтая / Красная карточки</TableCell>
                  <TableCell className="text-xs text-right">
                    {data.playerStats.yellowCards > 0
                      ? data.playerStats.yellowCards
                      : "—"}{" "}
                    / {data.playerStats.redCards > 0 ? data.playerStats.redCards : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-right">—</TableCell>
                  <TableCell className="text-xs text-right font-semibold">
                    {data.playerStats.yellowCards > 0
                      ? data.playerStats.yellowCards
                      : "—"}{" "}
                    / {data.playerStats.redCards > 0 ? data.playerStats.redCards : "—"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs">Единоборства / Успешные</TableCell>
                  <TableCell className="text-xs text-right">
                    {stats1H.duels} / {stats1H.successfulDuels}
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {stats2H.duels} / {stats2H.successfulDuels}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold">
                    {statsTotal.duels} / {statsTotal.successfulDuels}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs">Единоборства вверху</TableCell>
                  <TableCell className="text-xs text-right">
                    {stats1H.aerialDuels}
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {stats2H.aerialDuels}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold">
                    {statsTotal.aerialDuels}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs">Единоборства внизу</TableCell>
                  <TableCell className="text-xs text-right">
                    {stats1H.groundDuels}
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {stats2H.groundDuels}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold">
                    {statsTotal.groundDuels}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs">Отбор</TableCell>
                  <TableCell className="text-xs text-right">
                    {stats1H.tackles}
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {stats2H.tackles}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold">
                    {statsTotal.tackles}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs">Дриблинг / Успешный</TableCell>
                  <TableCell className="text-xs text-right">
                    {stats1H.dribbles} / {stats1H.successfulDribbles}
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {stats2H.dribbles} / {stats2H.successfulDribbles}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold">
                    {statsTotal.dribbles} / {statsTotal.successfulDribbles}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs">Подбор</TableCell>
                  <TableCell className="text-xs text-right">
                    {stats1H.recoveries}
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {stats2H.recoveries}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold">
                    {statsTotal.recoveries}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs">Перехват</TableCell>
                  <TableCell className="text-xs text-right">
                    {stats1H.interceptions}
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {stats2H.interceptions}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold">
                    {statsTotal.interceptions}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Table 3: Actions per minute */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            Действия на 1 минуту игры
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Показатель</TableHead>
                  <TableHead className="text-xs text-right">1-й тайм</TableHead>
                  <TableHead className="text-xs text-right">2-й тайм</TableHead>
                  <TableHead className="text-xs text-right">Матч</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-xs">Действия</TableCell>
                  <TableCell className="text-xs text-right">
                    {data.playerStats.minutesPlayed > 0
                      ? (
                          stats1H.totalEvents /
                          Math.max(1, Math.floor(data.playerStats.minutesPlayed / 2))
                        ).toFixed(2)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {data.playerStats.minutesPlayed > 0
                      ? (
                          stats2H.totalEvents /
                          Math.max(1, Math.ceil(data.playerStats.minutesPlayed / 2))
                        ).toFixed(2)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold">
                    {data.playerStats.minutesPlayed > 0
                      ? (
                          statsTotal.totalEvents /
                          Math.max(1, data.playerStats.minutesPlayed)
                        ).toFixed(2)
                      : "—"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-xs">Успешные</TableCell>
                  <TableCell className="text-xs text-right">
                    {data.playerStats.minutesPlayed > 0
                      ? (
                          (stats1H.successfulPasses +
                            stats1H.successfulDuels +
                            stats1H.successfulDribbles) /
                          Math.max(1, Math.floor(data.playerStats.minutesPlayed / 2))
                        ).toFixed(2)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-right">
                    {data.playerStats.minutesPlayed > 0
                      ? (
                          (stats2H.successfulPasses +
                            stats2H.successfulDuels +
                            stats2H.successfulDribbles) /
                          Math.max(1, Math.ceil(data.playerStats.minutesPlayed / 2))
                        ).toFixed(2)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-right font-semibold">
                    {data.playerStats.minutesPlayed > 0
                      ? (
                          (statsTotal.successfulPasses +
                            statsTotal.successfulDuels +
                            statsTotal.successfulDribbles) /
                          Math.max(1, data.playerStats.minutesPlayed)
                        ).toFixed(2)
                      : "—"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
