/**
 * API client functions for Public Teams operations
 * Wrappers around axios instance for type safety
 */

import { api } from "@/lib/api";
import type {
  Team,
  TeamProfile,
  TeamsListResponse,
  PaginationInput,
} from "@/lib/types/teams";

/**
 * Get paginated list of teams (public)
 */
export async function getTeamsList(
  params: PaginationInput
): Promise<TeamsListResponse> {
  const { page, pageSize } = params;
  const response = await api.get<TeamsListResponse>("/teams", {
    params: { page, pageSize },
  });
  return response.data;
}

/**
 * Get public team profile by ID
 */
export async function getTeamProfile(id: string): Promise<TeamProfile> {
  const response = await api.get<TeamProfile>(`/teams/${id}`);
  return response.data;
}

/**
 * Get all teams (for dropdown selection, large page size)
 */
export async function getAllTeams(): Promise<Team[]> {
  const response = await api.get<TeamsListResponse>("/teams", {
    params: { page: 1, pageSize: 1000 },
  });
  return response.data.teams;
}

/**
 * Get list of players in a team
 */
export async function getTeamPlayers(teamId: string) {
  const response = await api.get<{ players: Array<{
    id: string;
    firstName: string;
    lastName: string;
    position: string[];
    dateOfBirth: string;
    image: string | null;
    totalMatches: number;
    totalGoals: number;
    totalAssists: number;
  }> }>(`/teams/${teamId}/players`);
  return response.data.players;
}

/**
 * Get list of tournaments where team participates
 */
export async function getTeamTournaments(teamId: string) {
  const response = await api.get<{ tournaments: Array<{
    id: string;
    name: string;
    logo: string | null;
    season: string | null;
    location: string | null;
    startDate: string | null;
    endDate: string | null;
    isActive: boolean;
  }> }>(`/teams/${teamId}/tournaments`);
  return response.data.tournaments;
}

/**
 * Get list of recent matches for a team
 */
export async function getTeamMatches(teamId: string) {
  const response = await api.get<{ matches: Array<{
    id: string;
    date: string;
    homeTeamId: string;
    homeTeamName: string;
    homeTeamLogo: string | null;
    awayTeamId: string;
    awayTeamName: string;
    awayTeamLogo: string | null;
    homeScore: number | null;
    awayScore: number | null;
    tournamentId: string | null;
    tournamentName: string | null;
  }> }>(`/teams/${teamId}/matches`);
  return response.data.matches;
}

