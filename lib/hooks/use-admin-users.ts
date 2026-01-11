/**
 * TanStack Query hooks for Admin Users CRUD operations
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
} from "@/lib/api/admin/users";
import type {
  User,
  UsersListResponse,
  CreateUserRequest,
  UpdateUserRequest,
  PaginationInput,
} from "@/lib/types/admin-users";

/**
 * Query key factory for user-related queries
 */
export const userKeys = {
  all: ["admin-users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (params: PaginationInput) =>
    [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

/**
 * Hook to fetch paginated list of users
 */
export function useUsers(params: PaginationInput) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => getUsers(params),
  });
}

/**
 * Hook to fetch single user by ID
 */
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => getUser(id),
    enabled: !!id,
  });
}

/**
 * Hook to create a new user
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => createUser(data),
    onSuccess: () => {
      // Invalidate all user lists to refresh data
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to update a user
 * Uses optimistic updates for last-write-wins strategy
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      updateUser(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: userKeys.detail(id) });
      await queryClient.cancelQueries({ queryKey: userKeys.lists() });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData<User>(
        userKeys.detail(id)
      );
      const previousLists = queryClient.getQueriesData<UsersListResponse>({
        queryKey: userKeys.lists(),
      });

      // Optimistically update user detail
      if (previousUser) {
        queryClient.setQueryData<User>(userKeys.detail(id), {
          ...previousUser,
          ...data,
          updatedAt: new Date().toISOString(),
        });
      }

      // Optimistically update user in all lists
      previousLists.forEach(([queryKey, listData]) => {
        if (listData) {
          const updatedUsers = listData.users.map((user) =>
            user.id === id ? { ...user, ...data, updatedAt: new Date().toISOString() } : user
          );
          queryClient.setQueryData<UsersListResponse>(queryKey, {
            ...listData,
            users: updatedUsers,
          });
        }
      });

      return { previousUser, previousLists };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(
          userKeys.detail(_variables.id),
          context.previousUser
        );
      }
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          if (data) {
            queryClient.setQueryData(queryKey, data);
          }
        });
      }
    },
    onSettled: (_data, _error, variables) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to delete a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      // Invalidate all user lists to refresh data
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

/**
 * Hook to reset user password
 */
export function useResetUserPassword() {
  return useMutation({
    mutationFn: (id: string) => resetUserPassword(id),
  });
}
