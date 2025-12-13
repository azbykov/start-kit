/**
 * TanStack Query hooks for Admin Tournaments CRUD operations
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTournament,
  updateTournament,
  deleteTournament,
  addTeamToTournament,
  removeTeamFromTournament,
} from "@/lib/api/admin/tournaments";
import type {
  Tournament,
  CreateTournamentRequest,
  UpdateTournamentRequest,
  TournamentsListResponse,
} from "@/lib/types/tournaments";
import { tournamentKeys } from "./use-tournaments";

/**
 * Hook to create a new tournament
 */
export function useCreateTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTournamentRequest) => createTournament(data),
    onSuccess: () => {
      // Invalidate all tournament lists to refresh data
      queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
    },
  });
}

/**
 * Hook to update a tournament
 * Uses optimistic updates for last-write-wins strategy
 */
export function useUpdateTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTournamentRequest;
    }) => updateTournament(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: tournamentKeys.detail(id),
      });
      await queryClient.cancelQueries({ queryKey: tournamentKeys.lists() });

      // Snapshot previous value
      const previousTournament = queryClient.getQueryData<Tournament>(
        tournamentKeys.detail(id)
      );
      const previousLists =
        queryClient.getQueriesData<TournamentsListResponse>({
          queryKey: tournamentKeys.lists(),
        });

      // Optimistically update tournament detail
      if (previousTournament) {
        queryClient.setQueryData<Tournament>(
          tournamentKeys.detail(id),
          {
            ...previousTournament,
            ...data,
            updatedAt: new Date().toISOString(),
          }
        );
      }

      // Optimistically update tournament in all lists
      previousLists.forEach(([queryKey, listData]) => {
        if (listData) {
          const updatedTournaments = listData.tournaments.map((tournament) =>
            tournament.id === id
              ? {
                  ...tournament,
                  ...data,
                  updatedAt: new Date().toISOString(),
                }
              : tournament
          );
          queryClient.setQueryData<TournamentsListResponse>(queryKey, {
            ...listData,
            tournaments: updatedTournaments,
          });
        }
      });

      return { previousTournament, previousLists };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousTournament) {
        queryClient.setQueryData(
          tournamentKeys.detail(_variables.id),
          context.previousTournament
        );
      }
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          if (data) {
            queryClient.setQueryData(queryKey, data);
          }
        });
      }
    },
    onSettled: (_data, _error, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: tournamentKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
    },
  });
}

/**
 * Hook to delete a tournament
 */
export function useDeleteTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTournament(id),
    onSuccess: () => {
      // Invalidate all tournament lists and details to refresh data
      queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tournamentKeys.details() });
    },
  });
}

/**
 * Hook to add team to tournament
 */
export function useAddTeamToTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tournamentId,
      teamId,
    }: {
      tournamentId: string;
      teamId: string;
    }) => addTeamToTournament(tournamentId, teamId),
    onSuccess: (_data, variables) => {
      // Invalidate tournament teams and standings
      queryClient.invalidateQueries({
        queryKey: [...tournamentKeys.detail(variables.tournamentId), "teams"],
      });
      queryClient.invalidateQueries({
        queryKey: [...tournamentKeys.detail(variables.tournamentId), "standings"],
      });
    },
  });
}

/**
 * Hook to remove team from tournament
 */
export function useRemoveTeamFromTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tournamentId,
      teamId,
    }: {
      tournamentId: string;
      teamId: string;
    }) => removeTeamFromTournament(tournamentId, teamId),
    onSuccess: (_data, variables) => {
      // Invalidate tournament teams and standings
      queryClient.invalidateQueries({
        queryKey: [...tournamentKeys.detail(variables.tournamentId), "teams"],
      });
      queryClient.invalidateQueries({
        queryKey: [...tournamentKeys.detail(variables.tournamentId), "standings"],
      });
    },
  });
}

