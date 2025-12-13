"use client";

import type { PlayerProfile } from "@/lib/types/players";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

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
  const totalActions = statistics.totalAssists + statistics.totalGoals + statistics.totalMatches;
  
  const assistsPercent = totalActions > 0 
    ? Math.round((statistics.totalAssists / totalActions) * 100)
    : 0;
  const goalsPercent = totalActions > 0
    ? Math.round((statistics.totalGoals / totalActions) * 100)
    : 0;
  const matchesPercent = totalActions > 0
    ? Math.round((statistics.totalMatches / totalActions) * 100)
    : 0;
  
  // Normalize to 100%
  const remaining = 100 - assistsPercent - goalsPercent - matchesPercent;
  const passingPercent = Math.max(0, Math.round(remaining * 0.4));
  const defendingPercent = Math.max(0, Math.round(remaining * 0.3));
  const finishingPercent = Math.max(0, Math.round(remaining * 0.2));
  const individualPercent = Math.max(0, Math.round(remaining * 0.1));

  const performanceData = [
    { name: "Передачи", value: assistsPercent, color: "#3b82f6" },
    { name: "Пасы", value: passingPercent, color: "#eab308" },
    { name: "Защита", value: defendingPercent, color: "#a16207" },
    { name: "Завершение", value: finishingPercent, color: "#1e40af" },
    { name: "Индивидуальная игра", value: individualPercent, color: "#60a5fa" },
    { name: "Игра головой", value: Math.max(0, 100 - assistsPercent - passingPercent - defendingPercent - finishingPercent - individualPercent), color: "#f97316" },
  ].filter(item => item.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">PLAYER STATS</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Basic Statistics */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Нога</p>
                <p className="text-sm font-semibold">Правая</p>
              </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Матчей сыграно</p>
                <p className="text-sm font-semibold">{statistics.totalMatches}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Мин. за матч</p>
                <p className="text-sm font-semibold">{minutesPerMatch}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Голов забито</p>
                <p className="text-sm font-semibold">{statistics.totalGoals}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Голов за матч</p>
                <p className="text-sm font-semibold">{goalsPerMatch}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Жёлтые карточки</p>
                <p className="text-sm font-semibold">0</p>
          </div>
          <div>
                <p className="text-xs text-muted-foreground mb-1">Красные карточки</p>
                <p className="text-sm font-semibold">0</p>
              </div>
            </div>
          </div>

          {/* Middle: Performance Breakdown Donut Chart */}
          <div className="flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value, entry: any) => `${value}: ${entry.payload.value}%`}
                  wrapperStyle={{ fontSize: "10px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Right: Player Position Diagram */}
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[200px] aspect-[2/3] bg-green-600 rounded border-2 border-green-700">
              {/* Field markings */}
              <div className="absolute inset-0 flex flex-col">
                {/* Center circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 rounded-full border-2 border-white/50"></div>
                {/* Center line */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/50"></div>
                {/* Penalty boxes */}
                <div className="absolute top-0 left-1/4 right-1/4 h-1/4 border-r-2 border-l-2 border-b-2 border-white/50"></div>
                <div className="absolute bottom-0 left-1/4 right-1/4 h-1/4 border-r-2 border-l-2 border-t-2 border-white/50"></div>
                
                {/* Player position indicators */}
                <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 border-gray-800"></div>
                <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-300 border border-blue-600"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-300 border border-blue-600"></div>
                <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-300 border border-blue-600"></div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
