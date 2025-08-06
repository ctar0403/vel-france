import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { requestDeduplicator } from "@/utils/requestDeduplication";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  // Use deduplicator for GET requests to prevent duplicates
  if (method === 'GET') {
    return requestDeduplicator.fetch(method, url);
  }

  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return await res.json();
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    
    try {
      // Use deduplicator for all query requests
      return await requestDeduplicator.fetch('GET', url);
    } catch (error) {
      if (unauthorizedBehavior === "returnNull" && 
          error instanceof Error && 
          error.message.includes('401')) {
        return null;
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 minutes for better caching
      gcTime: 15 * 60 * 1000, // 15 minutes garbage collection time (v5 syntax)
      retry: (failureCount, error) => {
        // Don't retry 401/403 errors but retry network errors up to 1 time
        if (error instanceof Error && error.message.includes('401')) return false;
        if (error instanceof Error && error.message.includes('403')) return false;
        return failureCount < 1; // Reduced retries for faster failure handling
      },
      networkMode: 'offlineFirst', // Serve from cache when possible
      // Enable background refetching for critical data
      refetchOnMount: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: false,
      networkMode: 'online',
    },
  },
});
