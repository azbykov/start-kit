"use client";

import type { PlayerProfile } from "@/lib/types/players";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Play, ExternalLink } from "lucide-react";

interface PlayerVideosProps {
  videoLinks: PlayerProfile["videoLinks"];
}

const videoCategories = [
  "Автоматический видеоотчёт",
  "Лучшие действия",
  "Передачи",
  "Голы",
  "Пасы",
  "Умные пасы",
  "Ключевые пасы",
  "Дриблинг",
  "Удары",
  "Атакующие дуэли",
  "Защитные дуэли",
  "Движения без мяча",
  "Фолы",
  "Выигранные фолы",
  "Игра головой",
  "Навесы",
  "Сквозные передачи",
  "Ускорения",
];

export function PlayerVideos({ videoLinks }: PlayerVideosProps) {
  // Create table data from video links
  // For MVP, we'll use the same link for all categories
  // In future, each category could have its own link
  const videoTableData = videoCategories.map((category, index) => ({
    id: index,
    category,
    link: videoLinks && videoLinks.length > 0 ? videoLinks[0] : null,
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Видеозаписи</CardTitle>
          {videoLinks && videoLinks.length > 0 && (
            <Button variant="outline" size="sm" className="text-xs">
              Custom video report
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!videoLinks || videoLinks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Видео хайлайты отсутствуют
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead className="w-[100px] text-right">Действие</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videoTableData.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell className="text-xs text-muted-foreground">
                      {video.id + 1}
                    </TableCell>
                    <TableCell className="text-xs">{video.category}</TableCell>
                    <TableCell className="text-right">
                      {video.link ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          asChild
                        >
                          <a
                            href={video.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <Play className="h-3 w-3" />
                            Смотреть
                          </a>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Нет видео
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
