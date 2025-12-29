/**
 * API client functions for Public Players operations
 * Wrappers around axios instance for type safety
 */

import { api } from "@/lib/api";
import type {
  PaginationInput,
  PlayersListResponse,
  PlayerProfile,
  PlayerMatchesResponse,
  PlayerEventsResponse,
  PlayerMatchStatsResponse,
} from "@/lib/types/players";

/**
 * Get paginated list of players (public)
 */
export async function getPlayersList(
  params: PaginationInput
): Promise<PlayersListResponse> {
  const { page, pageSize } = params;
  const response = await api.get<PlayersListResponse>("/players", {
    params: { page, pageSize },
  });
  return response.data;
}

/**
 * Get public player profile by ID
 */
export async function getPlayerProfile(id: string): Promise<PlayerProfile> {
  const response = await api.get<PlayerProfile>(`/players/${id}`);
  return response.data;
}

/**
 * Get matches for a player with player statistics
 */
export async function getPlayerMatches(
  id: string
): Promise<PlayerMatchesResponse> {
  const response = await api.get<PlayerMatchesResponse>(
    `/players/${id}/matches`
  );
  return response.data;
}

/**
 * Get all events for a player across all matches
 */
export async function getPlayerEvents(
  id: string
): Promise<PlayerEventsResponse> {
  const response = await api.get<PlayerEventsResponse>(
    `/players/${id}/events`
  );
  return response.data;
}

/**
 * Get detailed statistics for a player in a specific match
 */
export async function getPlayerMatchStats(
  playerId: string,
  matchId: string
): Promise<PlayerMatchStatsResponse> {
  const response = await api.get<PlayerMatchStatsResponse>(
    `/players/${playerId}/matches/${matchId}/stats`
  );
  return response.data;
}



