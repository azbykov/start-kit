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

const passStats = [
  { label: "Всего передач", value: "74", accuracy: "89%" },
  { label: "Точные", value: "66", accuracy: "" },
  { label: "Вперёд / точные", value: "22/12", accuracy: "55%" },
  { label: "Назад / точные", value: "16/16", accuracy: "100%" },
  { label: "Поперечные / точные", value: "26/24", accuracy: "92%" },
  { label: "Длинные / точные", value: "8/5", accuracy: "63%" },
  { label: "Ключевые / точные", value: "1/1", accuracy: "100%" },
  { label: "Кроссы / точные", value: "3/2", accuracy: "67%" },
];

const passData = [
  { x: 20, y: 30, endX: 45, endY: 25, type: "accurate" },
  { x: 35, y: 50, endX: 55, endY: 45, type: "accurate" },
  { x: 50, y: 40, endX: 70, endY: 35, type: "key" },
  { x: 25, y: 60, endX: 40, endY: 55, type: "accurate" },
  { x: 45, y: 70, endX: 60, endY: 50, type: "inaccurate" },
  { x: 30, y: 45, endX: 50, endY: 40, type: "accurate" },
  { x: 55, y: 55, endX: 75, endY: 45, type: "accurate" },
  { x: 40, y: 35, endX: 65, endY: 30, type: "accurate" },
  { x: 25, y: 35, endX: 50, endY: 30, type: "accurate" },
  { x: 40, y: 55, endX: 60, endY: 50, type: "accurate" },
  { x: 55, y: 45, endX: 80, endY: 35, type: "key" },
  { x: 30, y: 65, endX: 45, endY: 60, type: "accurate" },
  { x: 35, y: 40, endX: 55, endY: 35, type: "inaccurate" },
  { x: 60, y: 50, endX: 85, endY: 40, type: "accurate" },
];

export function PassesBlock() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Передачи</CardTitle>
        <div className="flex gap-4 text-xs text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-primary"></span> Точная
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-amber-500"></span> Ключевая
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-red-500 opacity-50"></span> Неточная
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
                  <TableHead className="text-center">Кол-во</TableHead>
                  <TableHead className="text-center">Точность</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-sm">
                {passStats.map((stat, i) => (
                  <TableRow key={i} className={i === 0 ? "bg-muted/30 font-medium" : ""}>
                    <TableCell className="text-xs py-1.5">{stat.label}</TableCell>
                    <TableCell className="text-center text-xs py-1.5">{stat.value}</TableCell>
                    <TableCell className="text-center text-xs py-1.5 text-primary">
                      {stat.accuracy}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pitch Map */}
          <div>
            <PassPitchMap passes={passData} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const PassPitchMap = ({
  passes,
}: {
  passes: { x: number; y: number; endX: number; endY: number; type: string }[];
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

        {/* Passes */}
        {passes.map((pass, i) => (
          <g key={i}>
            <line
              x1={pass.x}
              y1={pass.y}
              x2={pass.endX}
              y2={pass.endY}
              stroke={
                pass.type === "accurate"
                  ? "hsl(var(--primary))"
                  : pass.type === "key"
                    ? "#f59e0b"
                    : "rgba(239, 68, 68, 0.5)"
              }
              strokeWidth="0.4"
              markerEnd={`url(#arrow-${pass.type})`}
            />
            <circle
              cx={pass.x}
              cy={pass.y}
              r="0.8"
              fill={
                pass.type === "accurate"
                  ? "hsl(var(--primary))"
                  : pass.type === "key"
                    ? "#f59e0b"
                    : "rgba(239, 68, 68, 0.5)"
              }
            />
          </g>
        ))}

        <defs>
          <marker
            id="arrow-accurate"
            markerWidth="2.5"
            markerHeight="2.5"
            refX="1.5"
            refY="1.25"
            orient="auto"
          >
            <polygon points="0 0, 2.5 1.25, 0 2.5" fill="hsl(var(--primary))" />
          </marker>
          <marker
            id="arrow-key"
            markerWidth="2.5"
            markerHeight="2.5"
            refX="1.5"
            refY="1.25"
            orient="auto"
          >
            <polygon points="0 0, 2.5 1.25, 0 2.5" fill="#f59e0b" />
          </marker>
          <marker
            id="arrow-inaccurate"
            markerWidth="2.5"
            markerHeight="2.5"
            refX="1.5"
            refY="1.25"
            orient="auto"
          >
            <polygon points="0 0, 2.5 1.25, 0 2.5" fill="rgba(239, 68, 68, 0.5)" />
          </marker>
        </defs>
      </svg>
    </div>
  );
};


