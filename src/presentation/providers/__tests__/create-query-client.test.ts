import { QueryClient } from '@tanstack/react-query';

import { createQueryClient } from '../create-query-client';

describe('createQueryClient (PRES-06)', () => {
  it('creates a QueryClient with staleTime 60_000 and retry false', () => {
    const client = createQueryClient();
    expect(client).toBeInstanceOf(QueryClient);

    const defaults = client.getDefaultOptions();
    expect(defaults.queries?.staleTime).toBe(60_000);
    expect(defaults.queries?.retry).toBe(false);
  });
});
