import { QueryClient } from '@tanstack/react-query';

import { QUERY_RETRY, QUERY_STALE_TIME_MS } from '../constants/query-client';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: QUERY_STALE_TIME_MS,
        retry: QUERY_RETRY,
      },
    },
  });
}
