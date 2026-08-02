import { QueryClient } from '@tanstack/react-query';

import { QUERY_RETRY, QUERY_STALE_TIME_MS } from '../../constants/query-client';
import { createQueryClient } from '../create-query-client';

describe('createQueryClient (PRES-06)', () => {
  it('creates a QueryClient with presentation query defaults', () => {
    const client = createQueryClient();
    expect(client).toBeInstanceOf(QueryClient);

    const defaults = client.getDefaultOptions();
    expect(defaults.queries?.staleTime).toBe(QUERY_STALE_TIME_MS);
    expect(defaults.queries?.retry).toBe(QUERY_RETRY);
  });
});
