/**
 * TanStack Query hooks for Public Teams operations
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getTeamsList,
  getTeamProfile,
  getAllTeams,
  getTeamPlayers,
  getTeamTournaments,
  getTeamMatches,
  getTeamStaff,
  getTeamStatistics,
} from "@/lib/api/teams";
import type {
  PaginationInput,
} from "@/lib/types/teams";

/**
 * Query key factory for team-related queries
 */
export const teamKeys = {
  all: ["teams"] as const,
  lists: () => [...teamKeys.all, "list"] as const,
  list: (params: PaginationInput) =>
    [...teamKeys.lists(), params] as const,
  details: () => [...teamKeys.all, "detail"] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
};

/**
 * Hook to fetch paginated list of teams (public)
 */
export function useTeamsList(params: PaginationInput) {
  return useQuery({
    queryKey: teamKeys.list(params),
    queryFn: () => getTeamsList(params),
  });
}

/**
 * Hook to fetch public team profile by ID
 */
export function useTeamProfile(id: string) {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: () => getTeamProfile(id),
    enabled: !!id,
  });
}

/**
 * Hook to fetch all teams (for dropdown selection)
 */
export function useAllTeams() {
  return useQuery({
    queryKey: [...teamKeys.all, "all"],
    queryFn: () => getAllTeams(),
  });
}

/**
 * Hook to fetch players in a team
 */
export function useTeamPlayers(teamId: string) {
  return useQuery({
    queryKey: [...teamKeys.detail(teamId), "players"],
    queryFn: () => getTeamPlayers(teamId),
    enabled: !!teamId,
  });
}

/**
 * Hook to fetch tournaments where team participates
 */
export function useTeamTournaments(teamId: string) {
  return useQuery({
    queryKey: [...teamKeys.detail(teamId), "tournaments"],
    queryFn: () => getTeamTournaments(teamId),
    enabled: !!teamId,
  });
}

/**
 * Hook to fetch recent matches for a team
 */
export function useTeamMatches(teamId: string) {
  return useQuery({
    queryKey: [...teamKeys.detail(teamId), "matches"],
    queryFn: () => getTeamMatches(teamId),
    enabled: !!teamId,
  });
}

/**
 * Hook to fetch team staff list
 */
export function useTeamStaff(teamId: string) {
  return useQuery({
    queryKey: [...teamKeys.detail(teamId), "staff"],
    queryFn: () => getTeamStaff(teamId),
    enabled: !!teamId,
  });
}

/**
 * Hook to fetch aggregated team statistics across all games
 */
export function useTeamStatistics(teamId: string) {
  return useQuery({
    queryKey: [...teamKeys.detail(teamId), "statistics"],
    queryFn: () => getTeamStatistics(teamId),
    enabled: !!teamId,
  });
}

