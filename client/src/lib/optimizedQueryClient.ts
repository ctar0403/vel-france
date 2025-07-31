import { QueryClient } from "@tanstack/react-query";

// Ultra-optimized query client for FCP performance
export const optimizedQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Aggressive caching for performance
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      
      // Disable refetching for FCP optimization
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      
      // Optimized retry logic
      retry: (failureCount, error: any) => {
        if (failureCount >= 2) return false;
        if (error?.status >= 400 && error?.status < 500) return false;
        return true;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Network mode optimization
      networkMode: 'online',
    },
    mutations: {
      retry: false,
      networkMode: 'online',
    },
  },
});