/**
 * TanStack Query hooks for Admin Matches CRUD operations
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createMatch,
  updateMatch,
  deleteMatch,
  addMatchPlayer,
  updateMatchPlayer,
  deleteMatchPlayer,
  addMatchEvent,
} from "@/lib/api/admin/matches";
import type {
  MatchProfile,
  CreateMatchRequest,
  UpdateMatchRequest,
  AddMatchPlayerRequest,
  UpdateMatchPlayerRequest,
  AddMatchEventRequest,
  MatchesListResponse,
} from "@/lib/types/matches";
import { matchKeys } from "./use-matches";

/**
 * Hook to create a new match
 */
export function useCreateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMatchRequest) => createMatch(data),
    onSuccess: (_data, variables) => {
      // Invalidate all match lists to refresh data
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
      // Invalidate tournament matches if tournamentId is provided
      if (variables.tournamentId) {
        queryClient.invalidateQueries({
          queryKey: ["tournaments", variables.tournamentId, "matches"],
        });
        queryClient.invalidateQueries({
          queryKey: ["tournaments", variables.tournamentId, "standings"],
        });
        queryClient.invalidateQueries({
          queryKey: ["tournaments", variables.tournamentId, "statistics"],
        });
      }
    },
  });
}

/**
 * Hook to update a match
 */
export function useUpdateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateMatchRequest;
    }) => updateMatch(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: matchKeys.detail(id),
      });
      await queryClient.cancelQueries({ queryKey: matchKeys.lists() });

      // Snapshot previous value
      const previousMatch = queryClient.getQueryData<MatchProfile>(
        matchKeys.detail(id)
      );
      const previousLists =
        queryClient.getQueriesData<MatchesListResponse>({
          queryKey: matchKeys.lists(),
        });

      // Optimistically update match detail
      if (previousMatch) {
        queryClient.setQueryData<MatchProfile>(
          matchKeys.detail(id),
          {
            ...previousMatch,
            ...data,
          }
        );
      }

      // Optimistically update match in all lists
      previousLists.forEach(([queryKey, listData]) => {
        if (listData) {
          const updatedMatches = listData.matches.map((match) =>
            match.id === id
              ? {
                  ...match,
                  ...data,
                  updatedAt: new Date().toISOString(),
                }
              : match
          );
          queryClient.setQueryData<MatchesListResponse>(queryKey, {
            ...listData,
            matches: updatedMatches,
          });
        }
      });

      return { previousMatch, previousLists };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousMatch) {
        queryClient.setQueryData(
          matchKeys.detail(_variables.id),
          context.previousMatch
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
        queryKey: matchKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
    },
  });
}

/**
 * Hook to delete a match
 */
export function useDeleteMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMatch(id),
    onSuccess: () => {
      // Invalidate all match lists and details to refresh data
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: matchKeys.details() });
    },
  });
}

/**
 * Hook to add a player to a match
 */
export function useAddMatchPlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      matchId,
      data,
    }: {
      matchId: string;
      data: AddMatchPlayerRequest;
    }) => addMatchPlayer(matchId, data),
    onSuccess: (_data, variables) => {
      // Invalidate match players to refresh data
      queryClient.invalidateQueries({
        queryKey: matchKeys.players(variables.matchId),
      });
    },
  });
}

/**
 * Hook to update player statistics in a match
 */
export function useUpdateMatchPlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      matchId,
      playerId,
      data,
    }: {
      matchId: string;
      playerId: string;
      data: UpdateMatchPlayerRequest;
    }) => updateMatchPlayer(matchId, playerId, data),
    onSuccess: (_data, variables) => {
      // Invalidate match players to refresh data
      queryClient.invalidateQueries({
        queryKey: matchKeys.players(variables.matchId),
      });
    },
  });
}

/**
 * Hook to remove a player from a match
 */
export function useDeleteMatchPlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      matchId,
      playerId,
    }: {
      matchId: string;
      playerId: string;
    }) => deleteMatchPlayer(matchId, playerId),
    onSuccess: (_data, variables) => {
      // Invalidate match players to refresh data
      queryClient.invalidateQueries({
        queryKey: matchKeys.players(variables.matchId),
      });
    },
  });
}

/**
 * Hook to add an event to a match
 */
export function useAddMatchEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      matchId,
      data,
    }: {
      matchId: string;
      data: AddMatchEventRequest;
    }) => addMatchEvent(matchId, data),
    onSuccess: (_data, variables) => {
      // Invalidate match events to refresh data
      queryClient.invalidateQueries({
        queryKey: matchKeys.events(variables.matchId),
      });
    },
  });
}

