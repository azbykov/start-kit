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

const finishingStats = [
  {
    position: "Всего",
    shots: "196",
    onTarget: "80",
    percent: "40.8%",
    xG: "32.98",
    goals: "31",
    conversion: "15.8%",
  },
  {
    position: "В штрафной",
    shots: "142",
    onTarget: "64",
    percent: "45.1%",
    xG: "28.29",
    goals: "27",
    conversion: "19%",
  },
  {
    position: "Из-за штрафной",
    shots: "52",
    onTarget: "14",
    percent: "26.9%",
    xG: "3.17",
    goals: "3",
    conversion: "5.8%",
  },
  {
    position: "После навеса",
    shots: "27",
    onTarget: "7",
    percent: "25.9%",
    xG: "5.37",
    goals: "3",
    conversion: "11.1%",
  },
  {
    position: "Со стандарта",
    shots: "31",
    onTarget: "7",
    percent: "22.6%",
    xG: "6.04",
    goals: "5",
    conversion: "16.1%",
  },
  {
    position: "Штрафные и пенальти",
    shots: "3",
    onTarget: "2",
    percent: "66.7%",
    xG: "1.52",
    goals: "1",
    conversion: "33.3%",
  },
];

const shotBodyParts = [
  { part: "Левой ногой", value: 41 },
  { part: "Головой", value: 38 },
  { part: "Правой ногой", value: 117 },
];

const timeDistribution = [
  { time: "1-15'", value: 30 },
  { time: "16-30'", value: 20 },
  { time: "31-45+'", value: 29 },
  { time: "46-60'", value: 33 },
  { time: "61-75'", value: 34 },
  { time: "76-120+'", value: 50 },
];

const shotLocations = [
  { x: 85, y: 22, result: "goal" },
  { x: 78, y: 35, result: "onTarget" },
  { x: 82, y: 28, result: "goal" },
  { x: 88, y: 42, result: "wide" },
  { x: 75, y: 48, result: "onTarget" },
  { x: 90, y: 38, result: "blocked" },
  { x: 72, y: 32, result: "wide" },
  { x: 86, y: 55, result: "goal" },
  { x: 80, y: 18, result: "onTarget" },
  { x: 70, y: 40, result: "wide" },
  { x: 92, y: 30, result: "goal" },
  { x: 77, y: 52, result: "onTarget" },
  { x: 68, y: 25, result: "blocked" },
  { x: 84, y: 45, result: "goal" },
  { x: 74, y: 58, result: "wide" },
  { x: 88, y: 25, result: "onTarget" },
  { x: 65, y: 38, result: "blocked" },
  { x: 82, y: 62, result: "wide" },
  { x: 79, y: 15, result: "onTarget" },
  { x: 91, y: 48, result: "goal" },
];

const goalShotLocations = [
  { x: 25, y: 30, result: "goal" },
  { x: 75, y: 25, result: "onTarget" },
  { x: 50, y: 20, result: "goal" },
  { x: 35, y: 60, result: "wide" },
  { x: 70, y: 45, result: "onTarget" },
  { x: 20, y: 35, result: "goal" },
  { x: 60, y: 70, result: "wide" },
  { x: 45, y: 35, result: "onTarget" },
  { x: 80, y: 30, result: "goal" },
  { x: 30, y: 50, result: "onTarget" },
  { x: 55, y: 15, result: "goal" },
  { x: 65, y: 55, result: "wide" },
  { x: 40, y: 40, result: "onTarget" },
  { x: 85, y: 40, result: "goal" },
  { x: 15, y: 45, result: "onTarget" },
];

export function FinishingBlock() {
  const maxBodyPart = Math.max(...shotBodyParts.map((s) => s.value));
  const maxTime = Math.max(...timeDistribution.map((t) => t.value));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Завершение атак</CardTitle>
        <div className="flex gap-4 text-xs text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-primary rotate-45"></span> Гол
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span> В створ
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full border-2 border-muted-foreground"></span> Мимо
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-muted-foreground"></span> Заблокирован
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left side - Pitch Map */}
          <div className="space-y-4">
            <ShotPitchMap shots={shotLocations} />

            {/* Time distribution bar chart */}
            <div>
              <div className="text-xs text-muted-foreground mb-2">Распределение по времени</div>
              <div className="flex items-end gap-1 h-16">
                {timeDistribution.map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="text-xs text-muted-foreground mb-1">{item.value}</div>
                    <div
                      className="w-full bg-primary/60 rounded-t"
                      style={{ height: `${(item.value / maxTime) * 100}%` }}
                    ></div>
                    <div className="text-[10px] text-muted-foreground mt-1">{item.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right side - Goal Map and Stats */}
          <div className="space-y-4">
            <GoalMap shots={goalShotLocations} />

            {/* Body part distribution */}
            <div>
              <div className="text-xs text-muted-foreground mb-2">По частям тела</div>
              <div className="flex gap-2">
                {shotBodyParts.map((item, i) => (
                  <div key={i} className="flex-1">
                    <div className="text-center text-sm font-medium mb-1">{item.value}</div>
                    <div className="h-2 bg-muted rounded overflow-hidden">
                      <div
                        className="h-full bg-primary/60"
                        style={{ width: `${(item.value / maxBodyPart) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-[10px] text-muted-foreground text-center mt-1">
                      {item.part}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats table */}
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead></TableHead>
                  <TableHead className="text-center text-[10px]">Уд./в ств.</TableHead>
                  <TableHead className="text-center text-[10px]">xG</TableHead>
                  <TableHead className="text-center text-[10px]">Голы</TableHead>
                  <TableHead className="text-center text-[10px]">Конв.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {finishingStats.map((stat, i) => (
                  <TableRow key={i} className={i === 0 ? "bg-muted/30 font-medium" : ""}>
                    <TableCell className="py-1">{stat.position}</TableCell>
                    <TableCell className="text-center py-1">
                      <span>
                        {stat.shots}/{stat.onTarget}
                      </span>
                      <span className="text-muted-foreground ml-1">{stat.percent}</span>
                    </TableCell>
                    <TableCell className="text-center py-1">{stat.xG}</TableCell>
                    <TableCell className="text-center py-1 text-primary font-medium">
                      {stat.goals}
                    </TableCell>
                    <TableCell className="text-center py-1">{stat.conversion}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const ShotPitchMap = ({
  shots,
}: {
  shots: { x: number; y: number; result: string }[];
}) => {
  return (
    <div className="relative bg-emerald-900/20 rounded border border-emerald-700/30 aspect-[4/3] overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 75">
        {/* Pitch - only showing attacking half */}
        <rect
          x="50"
          y="2"
          width="48"
          height="71"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="0.5"
        />

        {/* Center line */}
        <line x1="50" y1="2" x2="50" y2="73" stroke="hsl(var(--border))" strokeWidth="0.5" />

        {/* Right penalty area */}
        <rect
          x="84"
          y="20"
          width="14"
          height="35"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="0.5"
        />
        <rect
          x="93"
          y="28"
          width="5"
          height="19"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="0.5"
        />

        {/* Penalty arc */}
        <path
          d="M 84 30 Q 78 37.5 84 45"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="0.5"
        />

        {/* Goal */}
        <rect
          x="97"
          y="32"
          width="2"
          height="11"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="0.5"
        />

        {/* Shots */}
        {shots.map((shot, i) => (
          <g key={i}>
            {shot.result === "goal" && (
              <rect
                x={shot.x - 1.2}
                y={shot.y - 1.2}
                width="2.4"
                height="2.4"
                fill="hsl(var(--primary))"
                transform={`rotate(45 ${shot.x} ${shot.y})`}
              />
            )}
            {shot.result === "onTarget" && (
              <circle cx={shot.x} cy={shot.y} r="1.4" fill="#f59e0b" />
            )}
            {shot.result === "wide" && (
              <circle
                cx={shot.x}
                cy={shot.y}
                r="1.4"
                fill="none"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="0.5"
              />
            )}
            {shot.result === "blocked" && (
              <rect
                x={shot.x - 1.2}
                y={shot.y - 1.2}
                width="2.4"
                height="2.4"
                fill="hsl(var(--muted-foreground))"
              />
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};

const GoalMap = ({
  shots,
}: {
  shots: { x: number; y: number; result: string }[];
}) => {
  return (
    <div className="relative bg-muted/30 rounded border border-border aspect-[2/1] overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 50">
        {/* Goal frame */}
        <rect
          x="5"
          y="5"
          width="90"
          height="40"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="1"
        />

        {/* Goal net pattern */}
        {Array.from({ length: 9 }).map((_, i) => (
          <line
            key={`v-${i}`}
            x1={15 + i * 10}
            y1="5"
            x2={15 + i * 10}
            y2="45"
            stroke="hsl(var(--border))"
            strokeWidth="0.3"
            opacity="0.5"
          />
        ))}
        {Array.from({ length: 4 }).map((_, i) => (
          <line
            key={`h-${i}`}
            x1="5"
            y1={15 + i * 10}
            x2="95"
            y2={15 + i * 10}
            stroke="hsl(var(--border))"
            strokeWidth="0.3"
            opacity="0.5"
          />
        ))}

        {/* Shots on goal */}
        {shots.map((shot, i) => (
          <g key={i}>
            {shot.result === "goal" && (
              <rect
                x={shot.x - 1.5}
                y={shot.y - 1.5}
                width="3"
                height="3"
                fill="hsl(var(--primary))"
                transform={`rotate(45 ${shot.x} ${shot.y})`}
              />
            )}
            {shot.result === "onTarget" && (
              <circle cx={shot.x} cy={shot.y} r="1.8" fill="#f59e0b" />
            )}
            {shot.result === "wide" && (
              <circle
                cx={shot.x}
                cy={shot.y}
                r="1.8"
                fill="none"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="0.5"
              />
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};


