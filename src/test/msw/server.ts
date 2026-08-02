import { setupServer } from 'msw/node';

/**
 * Shared MSW server for infrastructure HTTP adapter tests.
 * Suites must call `listen` / `resetHandlers` / `close` themselves (suite-scoped).
 */
export const server = setupServer();
