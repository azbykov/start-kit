"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { useAddTeamToTournament } from "@/lib/hooks/use-admin-tournaments";
import { useQuery } from "@tanstack/react-query";
import { getAllTeams } from "@/lib/api/teams";

interface TournamentTeamAddDialogProps {
  tournamentId: string;
  currentTeamIds: string[]; // IDs of teams already in tournament
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function TournamentTeamAddDialog({
  tournamentId,
  currentTeamIds,
  open,
  onOpenChange,
  onSuccess,
}: TournamentTeamAddDialogProps) {
  const addMutation = useAddTeamToTournament();
  const [selectedTeamId, setSelectedTeamId] = React.useState<string>("");

  const { data: allTeams, isLoading: teamsLoading } = useQuery({
    queryKey: ["teams", "all"],
    queryFn: () => getAllTeams(),
    enabled: open,
  });

  // Filter out teams already in tournament
  const availableTeams = allTeams?.filter(
    (team) => !currentTeamIds.includes(team.id)
  );

  const handleSubmit = async () => {
    if (!selectedTeamId) return;

    try {
      await addMutation.mutateAsync({
        tournamentId,
        teamId: selectedTeamId,
      });
      setSelectedTeamId("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error adding team:", error);
    }
  };

  const isLoading = addMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Добавить команду в турнир</DialogTitle>
          <DialogDescription>
            Выберите команду для добавления в турнир. Команды, уже участвующие в турнире, не отображаются.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamId">
              Команда <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedTeamId}
              onValueChange={setSelectedTeamId}
              disabled={isLoading || teamsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите команду" />
              </SelectTrigger>
              <SelectContent>
                {availableTeams && availableTeams.length > 0 ? (
                  availableTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    Нет доступных команд
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {addMutation.error && (
            <div className="text-sm text-destructive">
              {addMutation.error instanceof Error
                ? addMutation.error.message
                : "Ошибка при добавлении команды"}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSelectedTeamId("");
              onOpenChange(false);
            }}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !selectedTeamId || teamsLoading}
          >
            {isLoading ? "Добавление..." : "Добавить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

