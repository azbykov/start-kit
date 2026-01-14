/**
 * API client functions for Admin Users CRUD operations
 * Wrappers around axios instance for type safety
 */

import { api } from "@/lib/api";
import type {
  User,
  UsersListResponse,
  CreateUserRequest,
  UpdateUserRequest,
  DeleteUserResponse,
  PaginationInput,
} from "@/lib/types/admin-users";

/**
 * Get paginated list of users
 */
export async function getUsers(
  params: PaginationInput
): Promise<UsersListResponse> {
  const { page, pageSize } = params;
  const response = await api.get<UsersListResponse>("/admin/users", {
    params: { page, pageSize },
  });
  return response.data;
}

/**
 * Get single user by ID
 */
export async function getUser(id: string): Promise<User> {
  const response = await api.get<User>(`/admin/users/${id}`);
  return response.data;
}

/**
 * Create a new user
 */
export async function createUser(
  data: CreateUserRequest
): Promise<User> {
  try {
    const response = await api.post<User>("/admin/users", data);
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
 * Update user by ID
 */
export async function updateUser(
  id: string,
  data: UpdateUserRequest
): Promise<User> {
  try {
    const response = await api.patch<User>(`/admin/users/${id}`, data);
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
 * Delete user by ID
 */
export async function deleteUser(id: string): Promise<DeleteUserResponse> {
  try {
    const response = await api.delete<DeleteUserResponse>(`/admin/users/${id}`);
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
 * Reset user password
 */
export async function resetUserPassword(
  id: string
): Promise<{ success: boolean; message: string; newPassword: string }> {
  try {
    const response = await api.post<{
      success: boolean;
      message: string;
      newPassword: string;
    }>(`/admin/users/${id}/reset-password`);
    return response.data;
  } catch (error: any) {
    // Extract error message from API response
    if (error?.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}