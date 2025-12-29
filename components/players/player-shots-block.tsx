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

const shotStats = [
  { label: "Всего ударов", value: "12", onTarget: "6", goals: "2" },
  { label: "В штрафной", value: "8", onTarget: "5", goals: "2" },
  { label: "Из-за штрафной", value: "4", onTarget: "1", goals: "0" },
  { label: "Ногой (правой)", value: "7", onTarget: "4", goals: "1" },
  { label: "Ногой (левой)", value: "3", onTarget: "1", goals: "0" },
  { label: "Головой", value: "2", onTarget: "1", goals: "1" },
];

const shotLocations = [
  { x: 85, y: 35, result: "goal" },
  { x: 88, y: 45, result: "onTarget" },
  { x: 82, y: 50, result: "onTarget" },
  { x: 78, y: 38, result: "wide" },
  { x: 90, y: 42, result: "goal" },
  { x: 75, y: 55, result: "blocked" },
  { x: 80, y: 48, result: "onTarget" },
  { x: 72, y: 40, result: "wide" },
  { x: 68, y: 35, result: "blocked" },
  { x: 86, y: 52, result: "onTarget" },
  { x: 70, y: 60, result: "wide" },
  { x: 83, y: 45, result: "onTarget" },
];

export function ShotsBlock() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Удары</CardTitle>
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
          {/* Table */}
          <div>
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead>Тип</TableHead>
                  <TableHead className="text-center">Всего</TableHead>
                  <TableHead className="text-center">В створ</TableHead>
                  <TableHead className="text-center">Голы</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {shotStats.map((stat, i) => (
                  <TableRow key={i} className={i === 0 ? "bg-muted/30 font-medium" : ""}>
                    <TableCell className="text-xs py-1.5">{stat.label}</TableCell>
                    <TableCell className="text-center text-xs py-1.5">{stat.value}</TableCell>
                    <TableCell className="text-center text-xs py-1.5">{stat.onTarget}</TableCell>
                    <TableCell className="text-center text-xs py-1.5 text-primary font-medium">
                      {stat.goals}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pitch Map */}
          <div>
            <ShotPitchMap shots={shotLocations} />
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



