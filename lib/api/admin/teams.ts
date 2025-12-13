/**
 * API client functions for Admin Teams CRUD operations
 * Wrappers around axios instance for type safety
 */

import { api } from "@/lib/api";
import type {
  Team,
  CreateTeamRequest,
  UpdateTeamRequest,
  DeleteTeamResponse,
} from "@/lib/types/teams";

/**
 * Create a new team
 */
export async function createTeam(
  data: CreateTeamRequest
): Promise<Team> {
  try {
    const response = await api.post<Team>("/admin/teams", data);
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
 * Update team by ID
 */
export async function updateTeam(
  id: string,
  data: UpdateTeamRequest
): Promise<Team> {
  try {
    const response = await api.patch<Team>(
      `/admin/teams/${id}`,
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
 * Delete team by ID
 */
export async function deleteTeam(
  id: string
): Promise<DeleteTeamResponse> {
  try {
    const response = await api.delete<DeleteTeamResponse>(
      `/admin/teams/${id}`
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

