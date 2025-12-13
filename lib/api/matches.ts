/**
 * API client functions for Public Matches operations
 * Wrappers around axios instance for type safety
 */

import { api } from "@/lib/api";
import type {
  Match,
  MatchProfile,
  MatchesListResponse,
  MatchPlayersResponse,
  MatchEvent,
  PaginationInput,
} from "@/lib/types/matches";

/**
 * Get paginated list of matches (public)
 */
export async function getMatchesList(
  params: PaginationInput & {
    tournamentId?: string;
    teamId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<MatchesListResponse> {
  const { page, pageSize, tournamentId, teamId, status, dateFrom, dateTo } =
    params;
  const response = await api.get<MatchesListResponse>("/matches", {
    params: {
      page,
      pageSize,
      tournamentId,
      teamId,
      status,
      dateFrom,
      dateTo,
    },
  });
  return response.data;
}

/**
 * Get public match profile by ID
 */
export async function getMatchProfile(id: string): Promise<MatchProfile> {
  const response = await api.get<MatchProfile>(`/matches/${id}`);
  return response.data;
}

/**
 * Get players for a match with statistics
 */
export async function getMatchPlayers(
  id: string
): Promise<MatchPlayersResponse> {
  const response = await api.get<MatchPlayersResponse>(
    `/matches/${id}/players`
  );
  return response.data;
}

/**
 * Get events for a match
 */
export async function getMatchEvents(
  id: string
): Promise<{ events: MatchEvent[] }> {
  const response = await api.get<{ events: MatchEvent[] }>(
    `/matches/${id}/events`
  );
  return response.data;
}

