"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { useAddMatchEvent } from "@/lib/hooks/use-admin-matches";
import { useQuery } from "@tanstack/react-query";
import { getTeamPlayers } from "@/lib/api/teams";

const addMatchEventFormSchema = z.object({
  eventId: z.string().min(1),
  subEventId: z.string().optional().nullable(),
  eventName: z.string().min(1).max(100),
  subEventName: z.string().max(100).optional().nullable(),
  playerId: z.string().optional().nullable(),
  teamId: z.string().min(1),
  matchPeriod: z.string().max(10),
  eventSec: z.string().min(1),
  startX: z.string().optional().nullable(),
  startY: z.string().optional().nullable(),
  endX: z.string().optional().nullable(),
  endY: z.string().optional().nullable(),
});

type AddMatchEventFormInput = z.infer<typeof addMatchEventFormSchema>;

interface MatchEventAddDialogProps {
  matchId: string;
  homeTeamId: string;
  awayTeamId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const eventTypes = [
  { id: 1, name: "Pass", subEvents: [{ id: 85, name: "Simple pass" }] },
  { id: 2, name: "Shot", subEvents: [] },
  { id: 3, name: "Goal", subEvents: [] },
  { id: 4, name: "Foul", subEvents: [] },
  { id: 5, name: "Card", subEvents: [] },
  { id: 6, name: "Substitution", subEvents: [] },
];

const matchPeriods = [
  { value: "1H", label: "1-й тайм" },
  { value: "2H", label: "2-й тайм" },
  { value: "ET1", label: "Доп. время 1" },
  { value: "ET2", label: "Доп. время 2" },
  { value: "P", label: "Пенальти" },
];

export function MatchEventAddDialog({
  matchId,
  homeTeamId,
  awayTeamId,
  open,
  onOpenChange,
  onSuccess,
}: MatchEventAddDialogProps) {
  const addMutation = useAddMatchEvent();
  const [selectedTeamId, setSelectedTeamId] = React.useState<string>("");

  const { data: homePlayers } = useQuery({
    queryKey: ["team", homeTeamId, "players"],
    queryFn: () => getTeamPlayers(homeTeamId),
    enabled: selectedTeamId === homeTeamId && !!homeTeamId,
  });

  const { data: awayPlayers } = useQuery({
    queryKey: ["team", awayTeamId, "players"],
    queryFn: () => getTeamPlayers(awayTeamId),
    enabled: selectedTeamId === awayTeamId && !!awayTeamId,
  });

  const players = selectedTeamId === homeTeamId ? homePlayers : awayPlayers;

  const form = useForm<AddMatchEventFormInput>({
    resolver: zodResolver(addMatchEventFormSchema),
    defaultValues: {
      eventId: "1",
      subEventId: null,
      eventName: "",
      subEventName: null,
      playerId: null,
      teamId: "",
      matchPeriod: "1H",
      eventSec: "0",
      startX: null,
      startY: null,
      endX: null,
      endY: null,
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = form;

  const watchedEventId = watch("eventId");
  const watchedTeamId = watch("teamId");

  React.useEffect(() => {
    if (watchedTeamId) {
      setSelectedTeamId(watchedTeamId);
    }
  }, [watchedTeamId]);

  React.useEffect(() => {
    const eventType = eventTypes.find((e) => e.id === parseInt(watchedEventId, 10));
    if (eventType) {
      setValue("eventName", eventType.name);
      if (eventType.subEvents.length > 0) {
        setValue("subEventId", eventType.subEvents[0].id.toString());
        setValue("subEventName", eventType.subEvents[0].name);
      } else {
        setValue("subEventId", null);
        setValue("subEventName", null);
      }
    }
  }, [watchedEventId, setValue]);

  const onSubmit = async (data: AddMatchEventFormInput) => {
    try {
      await addMutation.mutateAsync({
        matchId,
        data: {
          eventId: parseInt(data.eventId, 10),
          subEventId: data.subEventId ? parseInt(data.subEventId, 10) : null,
          eventName: data.eventName,
          subEventName: data.subEventName || null,
          playerId: data.playerId || null,
          teamId: data.teamId,
          matchPeriod: data.matchPeriod,
          eventSec: parseFloat(data.eventSec),
          startX: data.startX ? parseFloat(data.startX) : null,
          startY: data.startY ? parseFloat(data.startY) : null,
          endX: data.endX ? parseFloat(data.endX) : null,
          endY: data.endY ? parseFloat(data.endY) : null,
          tags: [],
        },
      });
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const isLoading = addMutation.isPending;
  const selectedEventType = eventTypes.find((e) => e.id === parseInt(watchedEventId, 10));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Добавить событие</DialogTitle>
          <DialogDescription>
            Добавьте новое событие в матч.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="teamId">
                Команда <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watchedTeamId}
                onValueChange={(value) => setValue("teamId", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите команду" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={homeTeamId}>Хозяева</SelectItem>
                  <SelectItem value={awayTeamId}>Гости</SelectItem>
                </SelectContent>
              </Select>
              {errors.teamId && (
                <p className="text-sm text-destructive">{errors.teamId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventId">
                Тип события <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watchedEventId.toString()}
                onValueChange={(value) => setValue("eventId", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((event) => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.eventId && (
                <p className="text-sm text-destructive">{errors.eventId.message}</p>
              )}
            </div>
          </div>

          {selectedEventType && selectedEventType.subEvents.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="subEventId">Подтип события</Label>
              <Select
                value={watch("subEventId")?.toString() || "none"}
                onValueChange={(value) =>
                  setValue("subEventId", value === "none" ? null : value)
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите подтип" />
                </SelectTrigger>
                <SelectContent>
                  {selectedEventType.subEvents.map((subEvent) => (
                    <SelectItem key={subEvent.id} value={subEvent.id.toString()}>
                      {subEvent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {watchedTeamId && (
            <div className="space-y-2">
              <Label htmlFor="playerId">Игрок</Label>
              <Select
                value={watch("playerId") || "none"}
                onValueChange={(value) =>
                  setValue("playerId", value === "none" ? null : value)
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите игрока" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Без игрока</SelectItem>
                  {players?.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.firstName} {player.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="matchPeriod">
                Период <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("matchPeriod")}
                onValueChange={(value) => setValue("matchPeriod", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите период" />
                </SelectTrigger>
                <SelectContent>
                  {matchPeriods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.matchPeriod && (
                <p className="text-sm text-destructive">{errors.matchPeriod.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventSec">
                Секунда события <span className="text-destructive">*</span>
              </Label>
              <Input
                id="eventSec"
                type="number"
                min="0"
                step="0.001"
                {...register("eventSec", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {errors.eventSec && (
                <p className="text-sm text-destructive">{errors.eventSec.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startX">Начало X (0-100)</Label>
              <Input
                id="startX"
                type="number"
                min="0"
                max="100"
                step="0.01"
                {...register("startX", { valueAsNumber: true })}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startY">Начало Y (0-100)</Label>
              <Input
                id="startY"
                type="number"
                min="0"
                max="100"
                step="0.01"
                {...register("startY", { valueAsNumber: true })}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endX">Конец X (0-100)</Label>
              <Input
                id="endX"
                type="number"
                min="0"
                max="100"
                step="0.01"
                {...register("endX", { valueAsNumber: true })}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endY">Конец Y (0-100)</Label>
              <Input
                id="endY"
                type="number"
                min="0"
                max="100"
                step="0.01"
                {...register("endY", { valueAsNumber: true })}
                disabled={isLoading}
              />
            </div>
          </div>

          {addMutation.error && (
            <div className="text-sm text-destructive">
              {addMutation.error instanceof Error
                ? addMutation.error.message
                : "Ошибка при добавлении события"}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Добавление..." : "Добавить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

