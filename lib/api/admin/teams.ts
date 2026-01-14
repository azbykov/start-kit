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
  TeamStaffMember,
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

/**
 * Create team staff member
 */
export async function createTeamStaffMember(params: {
  teamId: string;
  data: {
    fullName: string;
    roleTitle: string;
    phone?: string | null;
    email?: string | null;
    sortOrder?: number;
    isActive?: boolean;
  };
}): Promise<TeamStaffMember> {
  try {
    const response = await api.post<TeamStaffMember>(
      `/admin/teams/${params.teamId}/staff`,
      params.data
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}

/**
 * Update team staff member
 */
export async function updateTeamStaffMember(params: {
  teamId: string;
  staffId: string;
  data: {
    fullName?: string;
    roleTitle?: string;
    phone?: string | null;
    email?: string | null;
    sortOrder?: number;
    isActive?: boolean;
  };
}): Promise<TeamStaffMember> {
  try {
    const response = await api.patch<TeamStaffMember>(
      `/admin/teams/${params.teamId}/staff/${params.staffId}`,
      params.data
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}

/**
 * Delete team staff member
 */
export async function deleteTeamStaffMember(params: {
  teamId: string;
  staffId: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/admin/teams/${params.teamId}/staff/${params.staffId}`
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}

/**
 * Upload staff photo (multipart/form-data)
 */
export async function uploadTeamStaffPhoto(params: {
  teamId: string;
  staffId: string;
  file: File;
}): Promise<TeamStaffMember> {
  try {
    const formData = new FormData();
    formData.append("file", params.file);
    const response = await api.post<TeamStaffMember>(
      `/admin/teams/${params.teamId}/staff/${params.staffId}/photo`,
      formData
    );
    return response.data;
  } catch (error: any) {
    if (error?.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}

/**
 * Delete staff photo
 */
export async function deleteTeamStaffPhoto(params: {
  teamId: string;
  staffId: string;
}): Promise<{ success: boolean; message: string; staffId: string }> {
  try {
    const response = await api.delete<{
      success: boolean;
      message: string;
      staffId: string;
    }>(`/admin/teams/${params.teamId}/staff/${params.staffId}/photo`);
    return response.data;
  } catch (error: any) {
    if (error?.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}

