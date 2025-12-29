/**
 * TanStack Query hooks for Public Matches operations
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getMatchesList,
  getMatchProfile,
  getMatchPlayers,
  getMatchEvents,
} from "@/lib/api/matches";
import type {
  MatchEvent,
  PaginationInput,
} from "@/lib/types/matches";

/**
 * Query key factory for match-related queries
 */
export const matchKeys = {
  all: ["matches"] as const,
  lists: () => [...matchKeys.all, "list"] as const,
  list: (params: PaginationInput & {
    tournamentId?: string;
    teamId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => [...matchKeys.lists(), params] as const,
  details: () => [...matchKeys.all, "detail"] as const,
  detail: (id: string) => [...matchKeys.details(), id] as const,
  players: (id: string) => [...matchKeys.detail(id), "players"] as const,
  events: (id: string) => [...matchKeys.detail(id), "events"] as const,
};

/**
 * Hook to fetch paginated list of matches (public)
 */
export function useMatchesList(
  params: PaginationInput & {
    tournamentId?: string;
    teamId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }
) {
  return useQuery({
    queryKey: matchKeys.list(params),
    queryFn: () => getMatchesList(params),
  });
}

/**
 * Hook to fetch public match profile by ID
 */
export function useMatchProfile(id: string) {
  return useQuery({
    queryKey: matchKeys.detail(id),
    queryFn: () => getMatchProfile(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch players for a match with statistics
 */
export function useMatchPlayers(id: string) {
  return useQuery({
    queryKey: matchKeys.players(id),
    queryFn: () => getMatchPlayers(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch events for a match
 */
export function useMatchEvents(id: string) {
  return useQuery({
    queryKey: matchKeys.events(id),
    queryFn: () => getMatchEvents(id),
    enabled: !!id,
  });
}

