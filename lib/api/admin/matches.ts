/**
 * API client functions for Admin Matches CRUD operations
 * Wrappers around axios instance for type safety
 */

import { api } from "@/lib/api";
import type {
  Match,
  MatchPlayer,
  MatchEvent,
  CreateMatchRequest,
  UpdateMatchRequest,
  DeleteMatchResponse,
  AddMatchPlayerRequest,
  UpdateMatchPlayerRequest,
  AddMatchEventRequest,
} from "@/lib/types/matches";

/**
 * Create a new match
 */
export async function createMatch(
  data: CreateMatchRequest
): Promise<Match> {
  try {
    const response = await api.post<Match>("/admin/matches", data);
    return response.data;
  } catch (error: any) {
    // Extract error message from API response
    if (error?.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}

/**
 * Update match by ID
 */
export async function updateMatch(
  id: string,
  data: UpdateMatchRequest
): Promise<Match> {
  try {
    const response = await api.patch<Match>(`/admin/matches/${id}`, data);
    return response.data;
  } catch (error: any) {
    // Extract error message from API response
    if (error?.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}

/**
 * Delete match by ID
 */
export async function deleteMatch(
  id: string
): Promise<DeleteMatchResponse> {
  try {
    const response = await api.delete<DeleteMatchResponse>(
      `/admin/matches/${id}`
    );
    return response.data;
  } catch (error: any) {
    // Extract error message from API response
    if (error?.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}

/**
 * Add player to match
 */
export async function addMatchPlayer(
  matchId: string,
  data: AddMatchPlayerRequest
): Promise<MatchPlayer> {
  try {
    const response = await api.post<MatchPlayer>(
      `/admin/matches/${matchId}/players`,
      data
    );
    return response.data;
  } catch (error: any) {
    // Extract error message from API response
    if (error?.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}

/**
 * Update player statistics in match
 */
export async function updateMatchPlayer(
  matchId: string,
  playerId: string,
  data: UpdateMatchPlayerRequest
): Promise<MatchPlayer> {
  try {
    const response = await api.patch<MatchPlayer>(
      `/admin/matches/${matchId}/players/${playerId}`,
      data
    );
    return response.data;
  } catch (error: any) {
    // Extract error message from API response
    if (error?.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}

/**
 * Remove player from match
 */
export async function deleteMatchPlayer(
  matchId: string,
  playerId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/admin/matches/${matchId}/players/${playerId}`
    );
    return response.data;
  } catch (error: any) {
    // Extract error message from API response
    if (error?.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}

/**
 * Add event to match
 */
export async function addMatchEvent(
  matchId: string,
  data: AddMatchEventRequest
): Promise<MatchEvent> {
  try {
    const response = await api.post<MatchEvent>(
      `/admin/matches/${matchId}/events`,
      data
    );
    return response.data;
  } catch (error: any) {
    // Extract error message from API response
    if (error?.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}

