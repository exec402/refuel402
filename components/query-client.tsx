"use client";

import {
  QueryClientProvider as QueryClientProviderTanstack,
  QueryClient,
  defaultShouldDehydrateQuery,
} from "@tanstack/react-query";

let clientQueryClientSingleton: QueryClient | undefined = undefined;

import SuperJSON from "superjson";

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 30 * 1000,
      },
      dehydrate: {
        serializeData: SuperJSON.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        deserializeData: SuperJSON.deserialize,
      },
    },
  });

const getQueryClient = () => {
  if (typeof window === "undefined") {
    // Server: always make a new query client
    return createQueryClient();
  }
  // Browser: use singleton pattern to keep the same query client
  clientQueryClientSingleton ??= createQueryClient();

  return clientQueryClientSingleton;
};

export const QueryClientProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const queryClient = getQueryClient();
  return (
    <QueryClientProviderTanstack client={queryClient}>
      {children}
    </QueryClientProviderTanstack>
  );
};
