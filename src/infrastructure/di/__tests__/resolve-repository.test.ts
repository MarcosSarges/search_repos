import { http, HttpResponse } from 'msw';

import type { DataSource } from '@/application';
import { isAppError, type RepoRepository } from '@/domain';
import { server } from '@/test/msw/server';
import { useMswServer } from '@/test/msw/use-msw-server';

import { resolveRepository } from '../resolve-repository';

/**
 * INFRA-27..28, INFRA-31: DataSource resolves to HTTP adapters (not Fake).
 */
describe('resolveRepository (INFRA-27, INFRA-28, INFRA-31)', () => {
  useMswServer(server);

  it.each(['github', 'gitlab'] as const)(
    'WHEN resolveRepository(%s) is called THEN it returns an HTTP RepoRepository',
    async (dataSource: DataSource) => {
      const repository: RepoRepository = resolveRepository(dataSource);

      expect(typeof repository.search).toBe('function');
      expect(typeof repository.getById).toBe('function');
      expect(typeof repository.listIssues).toBe('function');
    },
  );

  it('WHEN resolveRepository(github) THEN Fail Fast invalid_input without Fake not_found', async () => {
    let httpHits = 0;
    server.use(
      http.get('https://api.github.com/*', () => {
        httpHits += 1;
        return HttpResponse.json({});
      }),
    );

    const repository = resolveRepository('github');

    try {
      await repository.getById('123');
      throw new Error('expected throw');
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      if (isAppError(error)) {
        expect(error.code).toBe('invalid_input');
      }
    }
    expect(httpHits).toBe(0);
  });

  it('WHEN resolveRepository(gitlab) THEN Fail Fast invalid_input without Fake not_found', async () => {
    let httpHits = 0;
    server.use(
      http.get('https://gitlab.com/api/v4/*', () => {
        httpHits += 1;
        return HttpResponse.json({});
      }),
    );

    const repository = resolveRepository('gitlab');

    try {
      await repository.getById('vuejs/vue');
      throw new Error('expected throw');
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      if (isAppError(error)) {
        expect(error.code).toBe('invalid_input');
      }
    }
    expect(httpHits).toBe(0);
  });

  it('WHEN called twice for the same source THEN it returns distinct repository instances', () => {
    const first = resolveRepository('github');
    const second = resolveRepository('github');

    expect(first).not.toBe(second);
  });

  it('WHEN token option is passed for github THEN Authorization Bearer is sent', async () => {
    let authorization: string | null = null;
    server.use(
      http.get('https://api.github.com/search/repositories', ({ request }) => {
        authorization = request.headers.get('Authorization');
        return HttpResponse.json({ total_count: 0, items: [] });
      }),
    );

    const repository = resolveRepository('github', { token: 'gh-only' });
    await repository.search({ query: 'x', page: 1 });

    expect(authorization).toBe('Bearer gh-only');
  });
});
