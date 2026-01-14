/**
 * TanStack Query hooks for Admin Teams CRUD operations
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTeam,
  updateTeam,
  deleteTeam,
  createTeamStaffMember,
  updateTeamStaffMember,
  deleteTeamStaffMember,
  uploadTeamStaffPhoto,
  deleteTeamStaffPhoto,
} from "@/lib/api/admin/teams";
import type {
  Team,
  CreateTeamRequest,
  UpdateTeamRequest,
  TeamsListResponse,
} from "@/lib/types/teams";
import { teamKeys } from "./use-teams";

/**
 * Hook to create a new team
 */
export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTeamRequest) => createTeam(data),
    onSuccess: () => {
      // Invalidate all team lists to refresh data
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
}

/**
 * Hook to update a team
 * Uses optimistic updates for last-write-wins strategy
 */
export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTeamRequest;
    }) => updateTeam(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: teamKeys.detail(id),
      });
      await queryClient.cancelQueries({ queryKey: teamKeys.lists() });

      // Snapshot previous value
      const previousTeam = queryClient.getQueryData<Team>(
        teamKeys.detail(id)
      );
      const previousLists =
        queryClient.getQueriesData<TeamsListResponse>({
          queryKey: teamKeys.lists(),
        });

      // Optimistically update team detail
      if (previousTeam) {
        queryClient.setQueryData<Team>(
          teamKeys.detail(id),
          {
            ...previousTeam,
            ...data,
            updatedAt: new Date().toISOString(),
          }
        );
      }

      // Optimistically update team in all lists
      previousLists.forEach(([queryKey, listData]) => {
        if (listData) {
          const updatedTeams = listData.teams.map((team) =>
            team.id === id
              ? {
                  ...team,
                  ...data,
                  updatedAt: new Date().toISOString(),
                }
              : team
          );
          queryClient.setQueryData<TeamsListResponse>(queryKey, {
            ...listData,
            teams: updatedTeams,
          });
        }
      });

      return { previousTeam, previousLists };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousTeam) {
        queryClient.setQueryData(
          teamKeys.detail(_variables.id),
          context.previousTeam
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
      queryClient.invalidateQueries({
        queryKey: teamKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
}

/**
 * Hook to delete a team
 */
export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTeam(id),
    onSuccess: () => {
      // Invalidate all team lists and details to refresh data
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamKeys.details() });
    },
  });
}

/**
 * Hook to create staff member
 */
export function useCreateTeamStaffMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      teamId: string;
      data: {
        fullName: string;
        roleTitle: string;
        phone?: string | null;
        email?: string | null;
        sortOrder?: number;
        isActive?: boolean;
      };
    }) => createTeamStaffMember(params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...teamKeys.detail(variables.teamId), "staff"],
      });
    },
  });
}

/**
 * Hook to update staff member
 */
export function useUpdateTeamStaffMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
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
    }) => updateTeamStaffMember(params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...teamKeys.detail(variables.teamId), "staff"],
      });
    },
  });
}

/**
 * Hook to delete staff member
 */
export function useDeleteTeamStaffMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { teamId: string; staffId: string }) =>
      deleteTeamStaffMember(params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...teamKeys.detail(variables.teamId), "staff"],
      });
    },
  });
}

/**
 * Hook to upload staff photo
 */
export function useUploadTeamStaffPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { teamId: string; staffId: string; file: File }) =>
      uploadTeamStaffPhoto(params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...teamKeys.detail(variables.teamId), "staff"],
      });
    },
  });
}

/**
 * Hook to delete staff photo
 */
export function useDeleteTeamStaffPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { teamId: string; staffId: string }) =>
      deleteTeamStaffPhoto(params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...teamKeys.detail(variables.teamId), "staff"],
      });
    },
  });
}

