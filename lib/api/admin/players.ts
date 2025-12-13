/**
 * API client functions for Admin Players CRUD operations
 * Wrappers around axios instance for type safety
 */

import { api } from "@/lib/api";
import type {
  Player,
  CreatePlayerRequest,
  UpdatePlayerRequest,
  DeletePlayerResponse,
} from "@/lib/types/players";

/**
 * Create a new player
 */
export async function createPlayer(
  data: CreatePlayerRequest
): Promise<Player> {
  try {
    const response = await api.post<Player>("/admin/players", data);
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
 * Update player by ID
 */
export async function updatePlayer(
  id: string,
  data: UpdatePlayerRequest
): Promise<Player> {
  try {
    const response = await api.patch<Player>(`/admin/players/${id}`, data);
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
 * Delete player by ID
 */
export async function deletePlayer(id: string): Promise<DeletePlayerResponse> {
  try {
    const response = await api.delete<DeletePlayerResponse>(
      `/admin/players/${id}`
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



