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
  ApiError,
  TournamentDocument,
} from "@/lib/types/tournaments";

type ApiFieldError = Error & { fieldErrors?: Record<string, string[]> };

function toApiFieldError(error: any): ApiFieldError {
  const data = error?.response?.data as ApiError | undefined;
  const message =
    (data && typeof data.error === "string" && data.error) ||
    "Произошла ошибка";
  const err = new Error(message) as ApiFieldError;
  if (data?.fieldErrors) {
    err.fieldErrors = data.fieldErrors;
  }
  return err;
}

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
    throw toApiFieldError(error);
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
    throw toApiFieldError(error);
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
    throw toApiFieldError(error);
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
    throw toApiFieldError(error);
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
    throw toApiFieldError(error);
  }
}

/**
 * Upload tournament document (multipart/form-data)
 */
export async function uploadTournamentDocument(params: {
  tournamentId: string;
  title?: string;
  file: File;
}): Promise<TournamentDocument> {
  try {
    const formData = new FormData();
    if (params.title) {
      formData.append("title", params.title);
    }
    formData.append("file", params.file);

    const response = await api.post<TournamentDocument>(
      `/admin/tournaments/${params.tournamentId}/documents`,
      formData
    );
    return response.data;
  } catch (error: any) {
    throw toApiFieldError(error);
  }
}

/**
 * Delete tournament document
 */
export async function deleteTournamentDocument(params: {
  tournamentId: string;
  documentId: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/admin/tournaments/${params.tournamentId}/documents/${params.documentId}`
    );
    return response.data;
  } catch (error: any) {
    throw toApiFieldError(error);
  }
}
