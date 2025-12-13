/**
 * TanStack Query hooks for Public Tournaments operations
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getTournamentsList,
  getTournamentProfile,
  getAllTournaments,
  getTournamentMatches,
  getTournamentStandings,
  getTournamentTeams,
  getTournamentStatistics,
} from "@/lib/api/tournaments";
import type { Tournament } from "@/lib/types/tournaments";
import type {
  TournamentProfile,
  TournamentsListResponse,
  PaginationInput,
} from "@/lib/types/tournaments";

/**
 * Query key factory for tournament-related queries
 */
export const tournamentKeys = {
  all: ["tournaments"] as const,
  lists: () => [...tournamentKeys.all, "list"] as const,
  list: (params: PaginationInput) =>
    [...tournamentKeys.lists(), params] as const,
  details: () => [...tournamentKeys.all, "detail"] as const,
  detail: (id: string) => [...tournamentKeys.details(), id] as const,
};

/**
 * Hook to fetch paginated list of tournaments (public)
 */
export function useTournamentsList(params: PaginationInput) {
  return useQuery({
    queryKey: tournamentKeys.list(params),
    queryFn: () => getTournamentsList(params),
  });
}

/**
 * Hook to fetch public tournament profile by ID
 */
export function useTournamentProfile(id: string) {
  return useQuery({
    queryKey: tournamentKeys.detail(id),
    queryFn: () => getTournamentProfile(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch all tournaments (for dropdown selection)
 */
export function useAllTournaments() {
  return useQuery({
    queryKey: [...tournamentKeys.all, "all"],
    queryFn: () => getAllTournaments(),
  });
}

/**
 * Hook to get matches for a tournament
 */
export function useTournamentMatches(id: string) {
  return useQuery({
    queryKey: [...tournamentKeys.detail(id), "matches"],
    queryFn: () => getTournamentMatches(id),
    enabled: !!id,
  });
}

/**
 * Hook to get tournament standings
 */
export function useTournamentStandings(id: string) {
  return useQuery({
    queryKey: [...tournamentKeys.detail(id), "standings"],
    queryFn: () => getTournamentStandings(id),
    enabled: !!id,
  });
}

/**
 * Hook to get teams in tournament
 */
export function useTournamentTeams(id: string) {
  return useQuery({
    queryKey: [...tournamentKeys.detail(id), "teams"],
    queryFn: () => getTournamentTeams(id),
    enabled: !!id,
  });
}

/**
 * Hook to get player statistics for tournament
 */
export function useTournamentStatistics(id: string) {
  return useQuery({
    queryKey: [...tournamentKeys.detail(id), "statistics"],
    queryFn: () => getTournamentStatistics(id),
    enabled: !!id,
  });
}

