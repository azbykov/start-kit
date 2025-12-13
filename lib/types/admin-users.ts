/**
 * TypeScript types for Admin Users CRUD
 * Derived from API contracts - source of truth
 */

import { Role } from "@prisma/client";

/**
 * User entity as returned from API
 */
export interface User {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string; // ISO 8601 datetime
  updatedAt: string; // ISO 8601 datetime
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
 * Response from GET /api/admin/users (list)
 */
export interface UsersListResponse {
  users: User[];
  pagination: Pagination;
}

/**
 * Request body for POST /api/admin/users (create)
 */
export interface CreateUserRequest {
  email: string;
  name?: string;
  role: Role;
  isActive?: boolean;
}

/**
 * Request body for PATCH /api/admin/users/[id] (update)
 */
export interface UpdateUserRequest {
  name?: string;
  role?: Role;
  isActive?: boolean;
  // email is NOT allowed (immutable)
}

/**
 * Response from DELETE /api/admin/users/[id]
 */
export interface DeleteUserResponse {
  success: boolean;
  message: string;
}

/**
 * API error response format
 */
export interface ApiError {
  error: string; // Russian error message
}

