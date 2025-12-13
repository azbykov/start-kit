/**
 * TanStack Query hooks for Admin Players CRUD operations
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPlayer,
  updatePlayer,
  deletePlayer,
} from "@/lib/api/admin/players";
import type {
  Player,
  CreatePlayerRequest,
  UpdatePlayerRequest,
  PlayersListResponse,
} from "@/lib/types/players";
import { playerKeys } from "./use-players";

/**
 * Hook to create a new player
 */
export function useCreatePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePlayerRequest) => createPlayer(data),
    onSuccess: () => {
      // Invalidate all player lists to refresh data
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() });
    },
  });
}

/**
 * Hook to update a player
 * Uses optimistic updates for last-write-wins strategy
 */
export function useUpdatePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlayerRequest }) =>
      updatePlayer(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: playerKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: playerKeys.lists() });

      // Snapshot previous value
      const previousPlayer = queryClient.getQueryData<Player>(
        playerKeys.detail(id)
      );
      const previousLists = queryClient.getQueriesData<PlayersListResponse>({
        queryKey: playerKeys.lists(),
      });

      // Optimistically update player detail
      if (previousPlayer) {
        queryClient.setQueryData<Player>(playerKeys.detail(id), {
          ...previousPlayer,
          ...data,
          updatedAt: new Date().toISOString(),
        });
      }

      // Optimistically update player in all lists
      previousLists.forEach(([queryKey, listData]) => {
        if (listData) {
          const updatedPlayers = listData.players.map((player) =>
            player.id === id
              ? { ...player, ...data, updatedAt: new Date().toISOString() }
              : player
          );
          queryClient.setQueryData<PlayersListResponse>(queryKey, {
            ...listData,
            players: updatedPlayers,
          });
        }
      });

      return { previousPlayer, previousLists };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousPlayer) {
        queryClient.setQueryData(
          playerKeys.detail(_variables.id),
          context.previousPlayer
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
        queryKey: playerKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() });
    },
  });
}

/**
 * Hook to delete a player
 */
export function useDeletePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePlayer(id),
    onSuccess: () => {
      // Invalidate all player lists and details to refresh data
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: playerKeys.details() });
    },
  });
}

