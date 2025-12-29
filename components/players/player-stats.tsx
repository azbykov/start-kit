"use client";

import type { PlayerProfile } from "@/lib/types/players";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

interface PlayerStatsProps {
  statistics: PlayerProfile["statistics"];
}

export function PlayerStats({ statistics }: PlayerStatsProps) {
  const minutesPerMatch = statistics.totalMatches > 0
    ? (statistics.totalMinutes / statistics.totalMatches).toFixed(0)
    : "0";

  const goalsPerMatch = statistics.totalMatches > 0
    ? (statistics.totalGoals / statistics.totalMatches).toFixed(1)
    : "0";

  // Calculate performance breakdown percentages
  // Using simplified calculation based on available stats
  // Performance calculation (currently unused, but may be used in future)
  // const totalActions = statistics.totalAssists + statistics.totalGoals + statistics.totalMatches;
  
  // Performance percentages (currently unused, but may be used in future)
  // const assistsPercent = totalActions > 0 
  //   ? Math.round((statistics.totalAssists / totalActions) * 100)
  //   : 0;
  // const goalsPercent = totalActions > 0
  //   ? Math.round((statistics.totalGoals / totalActions) * 100)
  //   : 0;
  // const matchesPercent = totalActions > 0
  //   ? Math.round((statistics.totalMatches / totalActions) * 100)
  //   : 0;
  
  // Normalize to 100% (currently unused, but may be used in future)
  // const remaining = 100 - assistsPercent - goalsPercent - matchesPercent;
  // Performance percentages (currently unused, but may be used in future)
  // const passingPercent = Math.max(0, Math.round(remaining * 0.4));
  // const defendingPercent = Math.max(0, Math.round(remaining * 0.3));
  // const finishingPercent = Math.max(0, Math.round(remaining * 0.2));
  // const individualPercent = Math.max(0, Math.round(remaining * 0.1));

  // Performance data calculation (currently unused, but may be used in future)
  // const performanceData = [
  //   { name: "Передачи", value: assistsPercent, color: "#3b82f6" },
  //   { name: "Пасы", value: passingPercent, color: "#eab308" },
  //   { name: "Защита", value: defendingPercent, color: "#a16207" },
  //   { name: "Завершение", value: finishingPercent, color: "#1e40af" },
  //   { name: "Индивидуальная игра", value: individualPercent, color: "#60a5fa" },
  //   { name: "Игра головой", value: Math.max(0, 100 - assistsPercent - passingPercent - defendingPercent - finishingPercent - individualPercent), color: "#f97316" },
  // ].filter(item => item.value > 0);

  // Calculate radar chart data
  const radarData = [
    { category: "Голы", value: Math.min(100, (statistics.totalGoals / statistics.totalMatches) * 10) || 0 },
    { category: "Ассисты", value: Math.min(100, (statistics.totalAssists / statistics.totalMatches) * 10) || 0 },
    { category: "Игра", value: Math.min(100, (statistics.totalMinutes / (statistics.totalMatches * 90)) * 100) || 0 },
    { category: "Передачи", value: 75 }, // Mock data
    { category: "Дриблинг", value: 60 }, // Mock data
    { category: "Защита", value: 45 }, // Mock data
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg uppercase tracking-wide text-foreground/80">
          Статистика игрока
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Stats Grid - Left Column */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <StatItemSmall label="Нога" value="Правая" />
            <StatItemSmall label="Матчей" value={statistics.totalMatches} />
            <StatItemSmall label="Мин./матч" value={minutesPerMatch} />
            <StatItemSmall label="Голов" value={statistics.totalGoals} />
            <StatItemSmall label="Гол/матч" value={goalsPerMatch} />
            <StatItemSmall label="ЖК" value="0" />
            <StatItemSmall label="КК" value="0" />
            <StatItemSmall label="Ассисты" value={statistics.totalAssists} />
            <StatItemSmall label="Точн. пас" value="89%" />
            <StatItemSmall label="Удары" value="12" />
            <StatItemSmall label="Отборы" value="5" />
            <StatItemSmall label="Перехв." value="8" />
            <StatItemSmall label="Верховые" value="67%" />
            <StatItemSmall label="Дриблинг" value="4" />
          </div>

          {/* Radar Chart - Right Column */}
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="80%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
                />
                <Radar
                  name="Характеристики"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const StatItemSmall = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div>
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="text-sm font-semibold text-foreground">{value}</div>
  </div>
);
