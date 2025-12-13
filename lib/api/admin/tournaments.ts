/**
 * API client functions for Admin Tournaments CRUD operations
 * Wrappers around axios instance for type safety
 */

import { api } from "@/lib/api";
import type {
  Tournament,
  CreateTournamentRequest,
  UpdateTournamentRequest,
  DeleteTournamentResponse,
} from "@/lib/types/tournaments";

/**
 * Create a new tournament
 */
export async function createTournament(
  data: CreateTournamentRequest
): Promise<Tournament> {
  try {
    const response = await api.post<Tournament>("/admin/tournaments", data);
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
 * Update tournament by ID
 */
export async function updateTournament(
  id: string,
  data: UpdateTournamentRequest
): Promise<Tournament> {
  try {
    const response = await api.patch<Tournament>(
      `/admin/tournaments/${id}`,
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
 * Delete tournament by ID
 */
export async function deleteTournament(
  id: string
): Promise<DeleteTournamentResponse> {
  try {
    const response = await api.delete<DeleteTournamentResponse>(
      `/admin/tournaments/${id}`
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
 * Add team to tournament
 */
export async function addTeamToTournament(
  tournamentId: string,
  teamId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.post<{ success: boolean; message: string }>(
      `/admin/tournaments/${tournamentId}/teams`,
      { teamId }
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
 * Remove team from tournament
 */
export async function removeTeamFromTournament(
  tournamentId: string,
  teamId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/admin/tournaments/${tournamentId}/teams`,
      {
        params: { teamId },
      }
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
