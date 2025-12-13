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
import { Calendar, Trophy } from "lucide-react";

interface PlayerTournamentsProps {
  playerId: string;
}

export function PlayerTournaments({ playerId }: PlayerTournamentsProps) {
  // TODO: Replace with actual data from API when tournaments/matches are implemented
  // For now, showing placeholder message
  const hasData = false;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">
          Турниры и матчи
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="text-center py-8 space-y-2">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
            <p className="text-sm text-muted-foreground">
              Данные о турнирах и матчах пока недоступны
            </p>
            <p className="text-xs text-muted-foreground">
              Информация появится после добавления функциональности турниров
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tournaments section */}
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Турниры
              </h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Название</TableHead>
                      <TableHead className="text-xs">Сезон</TableHead>
                      <TableHead className="text-xs text-right">Матчей</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Will be populated when tournaments are implemented */}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Matches section */}
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Последние матчи
              </h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Дата</TableHead>
                      <TableHead className="text-xs">Турнир</TableHead>
                      <TableHead className="text-xs">Команды</TableHead>
                      <TableHead className="text-xs text-right">Результат</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Will be populated when matches are implemented */}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

