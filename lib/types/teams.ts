/**
 * TypeScript types for Teams (Public and Admin)
 * Derived from API contracts - source of truth
 */

/**
 * Team entity as returned from public API
 */
export interface Team {
  id: string;
  name: string;
  logo: string | null;
  coach: string | null;
  city: string | null;
  country: string | null;
  isActive: boolean;
  createdAt: string; // ISO 8601 date
  updatedAt: string; // ISO 8601 date
  playersCount?: number; // Optional count of players (included in list responses)
}

/**
 * Team profile for public display
 */
export interface TeamProfile {
  id: string;
  name: string;
  logo: string | null;
  coach: string | null;
  city: string | null;
  country: string | null;
  isActive: boolean;
  playersCount?: number; // Optional count of players
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
 * Response from GET /api/teams (public list)
 */
export interface TeamsListResponse {
  teams: Team[];
  pagination: Pagination;
}

/**
 * Request body for POST /api/admin/teams (create)
 */
export interface CreateTeamRequest {
  name: string;
  logo?: string | null;
  coach?: string | null;
  city?: string | null;
  country?: string | null;
  isActive?: boolean;
}

/**
 * Request body for PATCH /api/admin/teams/[id] (update)
 */
export interface UpdateTeamRequest {
  name?: string;
  logo?: string | null;
  coach?: string | null;
  city?: string | null;
  country?: string | null;
  isActive?: boolean;
}

/**
 * Response from DELETE /api/admin/teams/[id]
 */
export interface DeleteTeamResponse {
  success: boolean;
  message: string;
}

/**
 * API error response format
 */
export interface ApiError {
  error: string; // Russian error message
}

