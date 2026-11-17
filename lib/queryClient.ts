// lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

/**
 * Every list hook used to refetch on each mount and window focus, which meant
 * dozens of duplicate server-action round trips per navigation (useSettings and
 * useAuth alone are mounted by the header, every button and every table).
 * A short stale window de-duplicates those; mutations still call refetch()
 * explicitly, so freshly-written data shows immediately.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
