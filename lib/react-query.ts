import { QueryClient } from "@tanstack/react-query";

/**
 * TanStack Query client configuration
 *
 * Default options:
 * - staleTime: 60 seconds - data is considered fresh for 60 seconds
 * - cacheTime: 5 minutes - unused data is kept in cache for 5 minutes
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
