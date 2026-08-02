import type { SetupServer } from 'msw/node';

/**
 * Suite-scoped MSW lifecycle — call once per describe file that uses the shared server.
 * Does not register global hooks that would affect DS/UI suites.
 */
export function useMswServer(server: SetupServer): void {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });
}
