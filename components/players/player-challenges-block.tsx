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

const challengeStats = [
  { label: "Всего единоборств", total: "22", won: "9", percent: "41%" },
  { label: "Оборонительные", total: "8", won: "2", percent: "25%" },
  { label: "Атакующие", total: "11", won: "5", percent: "45%" },
  { label: "Воздушные", total: "3", won: "2", percent: "67%" },
  { label: "Отборы", total: "5", won: "3", percent: "60%" },
  { label: "Обводки", total: "4", won: "2", percent: "50%" },
];

const challengeLocations = [
  { x: 30, y: 25, type: "won" },
  { x: 45, y: 40, type: "won" },
  { x: 60, y: 35, type: "lost" },
  { x: 25, y: 55, type: "neutral" },
  { x: 50, y: 50, type: "won" },
  { x: 70, y: 45, type: "lost" },
  { x: 35, y: 30, type: "won" },
  { x: 55, y: 60, type: "neutral" },
  { x: 40, y: 45, type: "won" },
  { x: 65, y: 30, type: "lost" },
  { x: 28, y: 42, type: "won" },
  { x: 48, y: 55, type: "lost" },
  { x: 72, y: 38, type: "won" },
  { x: 38, y: 62, type: "neutral" },
  { x: 58, y: 48, type: "won" },
  { x: 22, y: 35, type: "lost" },
  { x: 68, y: 52, type: "won" },
  { x: 42, y: 28, type: "neutral" },
  { x: 52, y: 42, type: "lost" },
  { x: 32, y: 58, type: "lost" },
  { x: 62, y: 25, type: "lost" },
  { x: 75, y: 48, type: "lost" },
];

export function ChallengesBlock() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Единоборства</CardTitle>
        <div className="flex gap-4 text-xs text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-primary"></span> Выиграно
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-muted-foreground"></span> Нейтрально
          </span>
          <span className="flex items-center gap-1">
            <span className="text-red-500 font-bold text-sm">✕</span> Проиграно
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Table */}
          <div>
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead>Тип</TableHead>
                  <TableHead className="text-center">Всего</TableHead>
                  <TableHead className="text-center">Выиграно</TableHead>
                  <TableHead className="text-center">%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {challengeStats.map((stat, i) => (
                  <TableRow key={i} className={i === 0 ? "bg-muted/30 font-medium" : ""}>
                    <TableCell className="text-xs py-1.5">{stat.label}</TableCell>
                    <TableCell className="text-center text-xs py-1.5">{stat.total}</TableCell>
                    <TableCell className="text-center text-xs py-1.5">{stat.won}</TableCell>
                    <TableCell className="text-center text-xs py-1.5 text-primary font-medium">
                      {stat.percent}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pitch Map */}
          <div>
            <ChallengePitchMap challenges={challengeLocations} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const ChallengePitchMap = ({
  challenges,
}: {
  challenges: { x: number; y: number; type: string }[];
}) => {
  return (
    <div className="relative bg-emerald-900/20 rounded border border-emerald-700/30 aspect-[4/3] overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 75">
        {/* Pitch outline */}
        <rect
          x="2"
          y="2"
          width="96"
          height="71"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="0.5"
        />

        {/* Center line */}
        <line x1="50" y1="2" x2="50" y2="73" stroke="hsl(var(--border))" strokeWidth="0.5" />

        {/* Center circle */}
        <circle cx="50" cy="37.5" r="8" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />

        {/* Left penalty area */}
        <rect
          x="2"
          y="20"
          width="14"
          height="35"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="0.5"
        />
        <rect
          x="2"
          y="28"
          width="5"
          height="19"
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="0.5"
        />

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

        {/* Challenges */}
        {challenges.map((challenge, i) => (
          <g key={i}>
            {challenge.type === "won" && (
              <circle cx={challenge.x} cy={challenge.y} r="1.4" fill="hsl(var(--primary))" />
            )}
            {challenge.type === "neutral" && (
              <rect
                x={challenge.x - 1.2}
                y={challenge.y - 1.2}
                width="2.4"
                height="2.4"
                fill="hsl(var(--muted-foreground))"
              />
            )}
            {challenge.type === "lost" && (
              <text
                x={challenge.x}
                y={challenge.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ef4444"
                fontSize="4"
                fontWeight="bold"
              >
                ✕
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
};



