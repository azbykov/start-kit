/**
 * API client functions for Public Players operations
 * Wrappers around axios instance for type safety
 */

import { api } from "@/lib/api";
import type {
  PlayersListQuery,
  PlayersListResponse,
  PlayerProfile,
  PlayerMatchesResponse,
  PlayerEventsResponse,
  PlayerMatchStatsResponse,
  PlayersRankingQuery,
  PlayersRankingResponse,
} from "@/lib/types/players";

/**
 * Get paginated list of players (public)
 */
export async function getPlayersList(
  params: PlayersListQuery
): Promise<PlayersListResponse> {
  const {
    page,
    pageSize,
    q,
    teamId,
    tournamentId,
    positions,
    dateOfBirthFrom,
    dateOfBirthTo,
    ratingFrom,
    ratingTo,
    sort,
  } = params;

  const positionsParam = positions && positions.length > 0 ? positions.join(",") : undefined;
  const response = await api.get<PlayersListResponse>("/players", {
    params: {
      page,
      pageSize,
      q,
      teamId,
      tournamentId,
      positions: positionsParam,
      dateOfBirthFrom,
      dateOfBirthTo,
      ratingFrom,
      ratingTo,
      sort,
    },
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

/**
 * Get players rankings by rating with scopes
 */
export async function getPlayersRanking(
  params: PlayersRankingQuery
): Promise<PlayersRankingResponse> {
  const response = await api.get<PlayersRankingResponse>("/players/rankings", {
    params,
  });
  return response.data;
}



