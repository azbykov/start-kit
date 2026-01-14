"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TeamStatisticsProps {
  statistics: {
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
  } | null;
  isLoading?: boolean;
}

export function TeamStatistics({ statistics, isLoading = false }: TeamStatisticsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Статистика команды</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            Загрузка...
          </div>
        ) : !statistics ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            Нет данных
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground">Игры</div>
              <div className="font-semibold">{statistics.played}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Очки</div>
              <div className="font-semibold">{statistics.points}</div>
            </div>
            <div>
              <div className="text-muted-foreground">В/Н/П</div>
              <div className="font-semibold">
                {statistics.wins}/{statistics.draws}/{statistics.losses}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Голы</div>
              <div className="font-semibold">
                {statistics.goalsFor}:{statistics.goalsAgainst}{" "}
                <span className="text-muted-foreground">
                  ({statistics.goalDifference > 0 ? "+" : ""}
                  {statistics.goalDifference})
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

