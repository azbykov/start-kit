/**
 * TypeScript types for Tournaments (Public and Admin)
 * Derived from API contracts - source of truth
 */

/**
 * Tournament entity as returned from public API
 */
export type TournamentStatus = "PLANNED" | "ACTIVE" | "FINISHED" | "CANCELLED";

export type ParticipantGender = "MALE" | "FEMALE" | "MIXED";

export interface Tournament {
  id: string;
  name: string;
  organizer: string | null;
  description: string | null;
  season: string | null;
  location: string | null;
  sport: string | null;
  format: string | null;
  gender: ParticipantGender | null;
  ageGroup: string | null;
  birthYearFrom: number | null;
  birthYearTo: number | null;
  status: TournamentStatus;
  logo: string | null;
  startDate: string | null; // ISO 8601 date
  endDate: string | null; // ISO 8601 date
  isActive: boolean;
  createdAt: string; // ISO 8601 date
  updatedAt: string; // ISO 8601 date
}

/**
 * Tournament profile for public display
 */
export interface TournamentProfile {
  id: string;
  name: string;
  organizer: string | null;
  description: string | null;
  season: string | null;
  location: string | null;
  sport: string | null;
  format: string | null;
  gender: ParticipantGender | null;
  ageGroup: string | null;
  birthYearFrom: number | null;
  birthYearTo: number | null;
  status: TournamentStatus;
  logo: string | null;
  startDate: string | null; // ISO 8601 date
  endDate: string | null; // ISO 8601 date
  isActive: boolean;
}

/**
 * Pagination metadata
 */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/**
 * Pagination input parameters
 */
export interface PaginationInput {
  page: number;
  pageSize: number;
}

/**
 * Response from GET /api/tournaments (public list)
 */
export interface TournamentsListResponse {
  tournaments: Tournament[];
  pagination: Pagination;
}

/**
 * Request body for POST /api/admin/tournaments (create)
 */
export interface CreateTournamentRequest {
  name: string;
  organizer?: string | null;
  description?: string | null;
  season?: string | null;
  location?: string | null;
  sport?: string | null;
  format?: string | null;
  gender?: ParticipantGender | null;
  ageGroup?: string | null;
  birthYearFrom?: number | null;
  birthYearTo?: number | null;
  status?: TournamentStatus;
  logo?: string | null;
  startDate?: string | null; // ISO 8601 date string
  endDate?: string | null; // ISO 8601 date string
  isActive?: boolean;
}

/**
 * Request body for PATCH /api/admin/tournaments/[id] (update)
 */
export interface UpdateTournamentRequest {
  name?: string;
  organizer?: string | null;
  description?: string | null;
  season?: string | null;
  location?: string | null;
  sport?: string | null;
  format?: string | null;
  gender?: ParticipantGender | null;
  ageGroup?: string | null;
  birthYearFrom?: number | null;
  birthYearTo?: number | null;
  status?: TournamentStatus;
  logo?: string | null;
  startDate?: string | null; // ISO 8601 date string
  endDate?: string | null; // ISO 8601 date string
  isActive?: boolean;
}

/**
 * Response from DELETE /api/admin/tournaments/[id]
 */
export interface DeleteTournamentResponse {
  success: boolean;
  message: string;
}

/**
 * API error response format
 */
export interface ApiError {
  error: string; // Russian error message
  fieldErrors?: Record<string, string[]>;
}

