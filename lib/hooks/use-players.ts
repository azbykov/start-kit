/**
 * TanStack Query hooks for Public Players operations
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getPlayersList,
  getPlayerProfile,
  getPlayerMatches,
  getPlayerEvents,
  getPlayerMatchStats,
} from "@/lib/api/players";
import type {
  PlayerProfile,
  PlayersListResponse,
  PaginationInput,
  PlayerMatchesResponse,
  PlayerEventsResponse,
  PlayerMatchStatsResponse,
} from "@/lib/types/players";

/**
 * Query key factory for player-related queries
 */
export const playerKeys = {
  all: ["players"] as const,
  lists: () => [...playerKeys.all, "list"] as const,
  list: (params: PaginationInput) =>
    [...playerKeys.lists(), params] as const,
  details: () => [...playerKeys.all, "detail"] as const,
  detail: (id: string) => [...playerKeys.details(), id] as const,
  matches: (id: string) => [...playerKeys.detail(id), "matches"] as const,
  events: (id: string) => [...playerKeys.detail(id), "events"] as const,
  matchStats: (playerId: string, matchId: string) =>
    [...playerKeys.matches(playerId), matchId, "stats"] as const,
};

/**
 * Hook to fetch paginated list of players (public)
 */
export function usePlayersList(params: PaginationInput) {
  return useQuery({
    queryKey: playerKeys.list(params),
    queryFn: () => getPlayersList(params),
  });
}

/**
 * Hook to fetch public player profile by ID
 */
export function usePlayerProfile(id: string) {
  return useQuery({
    queryKey: playerKeys.detail(id),
    queryFn: () => getPlayerProfile(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch matches for a player with player statistics
 */
export function usePlayerMatches(id: string) {
  return useQuery({
    queryKey: playerKeys.matches(id),
    queryFn: () => getPlayerMatches(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch all events for a player across all matches
 */
export function usePlayerEvents(id: string) {
  return useQuery({
    queryKey: playerKeys.events(id),
    queryFn: () => getPlayerEvents(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch detailed statistics for a player in a specific match
 */
export function usePlayerMatchStats(
  playerId: string,
  matchId: string
) {
  return useQuery({
    queryKey: playerKeys.matchStats(playerId, matchId),
    queryFn: () => getPlayerMatchStats(playerId, matchId),
    enabled: !!playerId && !!matchId,
  });
}



