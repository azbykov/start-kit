/**
 * API client functions for Public Tournaments operations
 * Wrappers around axios instance for type safety
 */

import { api } from "@/lib/api";
import type {
  Tournament,
  TournamentProfile,
  TournamentsListResponse,
  PaginationInput,
} from "@/lib/types/tournaments";

/**
 * Get paginated list of tournaments (public)
 */
export async function getTournamentsList(
  params: PaginationInput
): Promise<TournamentsListResponse> {
  const { page, pageSize } = params;
  const response = await api.get<TournamentsListResponse>("/tournaments", {
    params: { page, pageSize },
  });
  return response.data;
}

/**
 * Get public tournament profile by ID
 */
export async function getTournamentProfile(
  id: string
): Promise<TournamentProfile> {
  const response = await api.get<TournamentProfile>(`/tournaments/${id}`);
  return response.data;
}

/**
 * Get all tournaments (for dropdown selection, large page size)
 */
export async function getAllTournaments(): Promise<Tournament[]> {
  const response = await api.get<TournamentsListResponse>("/tournaments", {
    params: { page: 1, pageSize: 1000 },
  });
  return response.data.tournaments;
}

/**
 * Get matches for a tournament
 */
export async function getTournamentMatches(id: string) {
  const response = await api.get<{ matches: Array<{
    id: string;
    date: string;
    time: string | null;
    stadium: string | null;
    status: string;
    homeTeam: {
      id: string;
      name: string;
      logo: string | null;
    };
    awayTeam: {
      id: string;
      name: string;
      logo: string | null;
    };
    homeScore: number | null;
    awayScore: number | null;
    createdAt: string;
  }> }>(`/tournaments/${id}/matches`);
  return response.data.matches;
}

/**
 * Get tournament standings/table
 */
export async function getTournamentStandings(id: string) {
  const response = await api.get<{ standings: Array<{
    team: {
      id: string;
      name: string;
      logo: string | null;
    };
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
    points: number;
  }> }>(`/tournaments/${id}/standings`);
  return response.data.standings;
}

/**
 * Get teams participating in tournament
 */
export async function getTournamentTeams(id: string) {
  const response = await api.get<{ teams: Array<{
    id: string;
    name: string;
    logo: string | null;
    city: string | null;
    country: string | null;
  }> }>(`/tournaments/${id}/teams`);
  return response.data.teams;
}

/**
 * Get player statistics for tournament
 */
export async function getTournamentStatistics(id: string) {
  const response = await api.get<{ statistics: Array<{
    player: {
      id: string;
      firstName: string;
      lastName: string;
      image: string | null;
      position: string[];
    };
    team: {
      id: string;
      name: string;
      logo: string | null;
    };
    matches: number;
    goals: number;
    assists: number;
    yellowCards: number;
    redCards: number;
    minutesPlayed: number;
  }> }>(`/tournaments/${id}/statistics`);
  return response.data.statistics;
}

