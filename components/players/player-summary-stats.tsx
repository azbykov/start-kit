"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SummaryStatsTableProps {
  statistics: {
    totalMatches: number;
    totalGoals: number;
    totalAssists: number;
    totalMinutes: number;
  };
}

export function SummaryStatsTable({ statistics: _statistics }: SummaryStatsTableProps) {
  // Mock data for detailed stats - in real app this would come from API
  const passAccuracy = 89; // This should come from actual stats
  const dribbles = 4; // This should come from actual stats
  const interceptions = 8; // This should come from actual stats
  const tackles = 5; // This should come from actual stats

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg uppercase tracking-wide text-foreground/80">
          Сводная статистика
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="text-xs">
              <TableHead className="w-[180px]"></TableHead>
              <TableHead className="text-center">Матч</TableHead>
              <TableHead className="text-center">1-й тайм</TableHead>
              <TableHead className="text-center">2-й тайм</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-sm">
            <StatsRow
              label="Действия / успешные"
              match="120/72"
              first="57/31"
              second="63/41"
              highlight
            />
            <StatsRow label="Удары / в створ" match="4/2" first="2/1" second="2/1" />
            <StatsRow
              label="Передачи / точные"
              match={`74/66 ${passAccuracy}%`}
              first="34/25"
              second="40/35"
            />
            <StatsRow
              label="Передачи вперёд / точные"
              match="22/12"
              first="13/6"
              second="9/5"
            />
            <StatsRow
              label="Передачи назад / точные"
              match="16/16"
              first="4/4"
              second="12/12"
            />
            <StatsRow
              label="Поперечные передачи / точные"
              match="26/24"
              first="11/10"
              second="15/14"
            />
            <StatsRow
              label="Ключевые передачи / точные"
              match="1/1"
              first="0"
              second="1/1"
            />
            <StatsRow label="Кроссы / точные" match="3/2" first="1/0" second="2/2" />
            <StatsRow
              label="Обводки / успешные"
              match={`${dribbles}/1`}
              first="2/1"
              second="0"
            />
            <StatsRow
              label="Единоборства / выиграно"
              match="22/9"
              first="11/4"
              second="11/5"
            />
            <StatsRow
              label="Оборон. единоб. / выиграно"
              match="8/2"
              first="2/1"
              second="6/1"
            />
            <StatsRow
              label="Воздушные единоб. / выиграно"
              match="3/2"
              first="2/1"
              second="1/1"
            />
            <StatsRow
              label="Атакующие единоб. / выиграно"
              match="11/5"
              first="7/2"
              second="4/3"
            />
            <StatsRow
              label="Перехваты"
              match={String(interceptions)}
              first="4"
              second="4"
            />
            <StatsRow label="Отборы" match={String(tackles)} first="3" second="2" />
            <StatsRow label="Фолы" match="2" first="1" second="1" />
            <StatsRow label="Фолы соперника" match="3" first="1" second="2" />
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

const StatsRow = ({
  label,
  match,
  first,
  second,
  highlight = false,
}: {
  label: string;
  match: string;
  first: string;
  second: string;
  highlight?: boolean;
}) => (
  <TableRow className={highlight ? "bg-muted/30" : ""}>
    <TableCell className="text-xs py-1.5">{label}</TableCell>
    <TableCell className="text-center text-xs py-1.5 font-medium">{match}</TableCell>
    <TableCell className="text-center text-xs py-1.5 text-muted-foreground">
      {first}
    </TableCell>
    <TableCell className="text-center text-xs py-1.5 text-muted-foreground">
      {second}
    </TableCell>
  </TableRow>
);



