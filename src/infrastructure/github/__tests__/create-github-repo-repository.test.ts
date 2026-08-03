import { http, HttpResponse } from 'msw';

import { isAppError } from '@/domain';
import { server } from '@/test/msw/server';
import { useMswServer } from '@/test/msw/use-msw-server';

import { createGithubRepoRepository } from '../create-github-repo-repository';
import searchFixture from '@/test/msw/fixtures/github/search-repos.json';
import repoDetailFixture from '@/test/msw/fixtures/github/repo-detail.json';
import issuesFixture from '@/test/msw/fixtures/github/issues.json';

describe('createGithubRepoRepository', () => {
  useMswServer(server);

  it('search maps items to Repo with id=full_name and no totalCount on result', async () => {
    server.use(
      http.get('https://api.github.com/search/repositories', ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('sort')).toBe('stars');
        expect(url.searchParams.get('order')).toBe('desc');
        return HttpResponse.json(searchFixture);
      }),
    );

    const repo = createGithubRepoRepository();
    const result = await repo.search({ query: 'react', page: 1, perPage: 20 });

    expect(result.items).toHaveLength(2);
    expect(result.items[0]?.id).toBe('facebook/react');
    expect(result.items[0]?.fullName).toBe('facebook/react');
    expect(result.items[1]?.description).toBeUndefined();
    expect(result.items[1]?.language).toBeUndefined();
    expect(result.items[1]?.ownerAvatarUrl).toBeUndefined();
    expect(result.page).toBe(1);
    expect(result.perPage).toBe(20);
    expect(result).not.toHaveProperty('totalCount');
    expect(result.hasNextPage).toBe(false);
  });

  it('search hasNextPage is false when page*perPage >= 1000 even if total_count is 5000', async () => {
    server.use(
      http.get('https://api.github.com/search/repositories', () => {
        return HttpResponse.json({
          total_count: 5000,
          items: Array.from({ length: 20 }, (_, i) => ({
            full_name: `org/repo-${i}`,
            name: `repo-${i}`,
            description: 'x',
            stargazers_count: 1,
            forks_count: 0,
            watchers_count: 1,
            language: 'TS',
            owner: { login: 'org', avatar_url: 'https://a' },
            html_url: `https://github.com/org/repo-${i}`,
          })),
        });
      }),
    );

    const repo = createGithubRepoRepository();
    // page 50 * perPage 20 = 1000 → not < min(5000, 1000) → false
    const result = await repo.search({ query: 'react', page: 50, perPage: 20 });
    expect(result.hasNextPage).toBe(false);
  });

  it('search hasNextPage is true when within the 1000-result window', async () => {
    server.use(
      http.get('https://api.github.com/search/repositories', () => {
        return HttpResponse.json({
          total_count: 500,
          items: Array.from({ length: 20 }, (_, i) => ({
            full_name: `org/repo-${i}`,
            name: `repo-${i}`,
            description: 'x',
            stargazers_count: 1,
            forks_count: 0,
            watchers_count: 1,
            language: 'TS',
            owner: { login: 'org', avatar_url: 'https://a' },
            html_url: `https://github.com/org/repo-${i}`,
          })),
        });
      }),
    );

    const repo = createGithubRepoRepository();
    const result = await repo.search({ query: 'react', page: 1, perPage: 20 });
    expect(result.hasNextPage).toBe(true);
  });

  it('getById / listIssues reject invalid repoId without HTTP', async () => {
    let httpHits = 0;
    server.use(
      http.get('https://api.github.com/*', () => {
        httpHits += 1;
        return HttpResponse.json({});
      }),
    );

    const repo = createGithubRepoRepository();

    try {
      await repo.getById('123');
      throw new Error('expected throw');
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      if (isAppError(error)) {
        expect(error.code).toBe('invalid_input');
      }
    }

    try {
      await repo.listIssues({ repoId: '12345', page: 1 });
      throw new Error('expected throw');
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      if (isAppError(error)) {
        expect(error.code).toBe('invalid_input');
      }
    }

    expect(httpHits).toBe(0);
  });

  it('getById maps repository detail with undefined for null description', async () => {
    server.use(
      http.get('https://api.github.com/repos/facebook/react', () => {
        return HttpResponse.json(repoDetailFixture);
      }),
    );

    const repo = createGithubRepoRepository();
    const detail = await repo.getById('facebook/react');

    expect(detail.id).toBe('facebook/react');
    expect(detail.description).toBeUndefined();
    expect(detail.language).toBe('JavaScript');
    expect(detail.ownerName).toBe('facebook');
  });

  it('listIssues maps open issues and uses Link rel=next for hasNextPage', async () => {
    server.use(
      http.get('https://api.github.com/repos/facebook/react/issues', ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('state')).toBe('open');
        return HttpResponse.json(issuesFixture, {
          headers: {
            Link: '<https://api.github.com/repos/facebook/react/issues?page=2>; rel="next"',
          },
        });
      }),
    );

    const repo = createGithubRepoRepository();
    const result = await repo.listIssues({
      repoId: 'facebook/react',
      page: 1,
      perPage: 20,
    });

    expect(result.items).toHaveLength(2);
    expect(result.items[0]?.labels[0]).toEqual({ id: '100', name: 'bug', color: 'ff0000' });
    expect(result.items[0]?.state).toBe('open');
    expect(result.items[0]?.comments).toBe(2);
    expect(result.items[0]?.updatedAt).toBe('2024-01-02T00:00:00Z');
    expect(result.items[1]?.authorAvatarUrl).toBeUndefined();
    expect(result.items[1]?.labels[0]?.color).toBeUndefined();
    expect(result.hasNextPage).toBe(true);
  });

  it('WHEN listIssues payload includes pull_request THEN those items are excluded (DIC-06)', async () => {
    server.use(
      http.get('https://api.github.com/repos/facebook/react/issues', () => {
        return HttpResponse.json([
          {
            id: 1,
            number: 10,
            title: 'Real issue',
            user: { login: 'alice', avatar_url: null },
            labels: [],
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z',
            state: 'open',
            comments: 0,
            html_url: 'https://github.com/facebook/react/issues/10',
          },
          {
            id: 99,
            number: 99,
            title: 'Actually a PR',
            user: { login: 'bot', avatar_url: null },
            labels: [],
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z',
            state: 'open',
            comments: 1,
            html_url: 'https://github.com/facebook/react/pull/99',
            pull_request: { url: 'https://api.github.com/repos/facebook/react/pulls/99' },
          },
        ]);
      }),
    );

    const repo = createGithubRepoRepository();
    const result = await repo.listIssues({
      repoId: 'facebook/react',
      page: 1,
      perPage: 20,
    });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.id).toBe('1');
    expect(result.items[0]?.title).toBe('Real issue');
  });

  it('listIssues empty page yields hasNextPage false', async () => {
    server.use(
      http.get('https://api.github.com/repos/facebook/react/issues', () => {
        return HttpResponse.json([]);
      }),
    );

    const repo = createGithubRepoRepository();
    const result = await repo.listIssues({
      repoId: 'facebook/react',
      page: 1,
      perPage: 20,
    });

    expect(result.items).toEqual([]);
    expect(result.hasNextPage).toBe(false);
  });

  it('sends Bearer token when configured and maps HTTP errors', async () => {
    let authorization: string | null = null;

    server.use(
      http.get('https://api.github.com/search/repositories', ({ request }) => {
        authorization = request.headers.get('Authorization');
        return new HttpResponse(null, {
          status: 429,
          headers: { 'X-RateLimit-Reset': '1700000000' },
        });
      }),
      http.get('https://api.github.com/repos/owner/missing', () => {
        return new HttpResponse(null, { status: 404 });
      }),
      http.get('https://api.github.com/repos/owner/secret', () => {
        return new HttpResponse(null, { status: 401 });
      }),
      http.get('https://api.github.com/repos/owner/locked', () => {
        return new HttpResponse(null, { status: 403 });
      }),
    );

    const repo = createGithubRepoRepository({ token: 'gh-token' });

    try {
      await repo.search({ query: 'x', page: 1 });
      throw new Error('expected throw');
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      if (isAppError(error)) {
        expect(error.code).toBe('rate_limit');
        expect(error.cause).toEqual({
          status: 429,
          resetAtEpochSeconds: 1700000000,
        });
      }
    }
    expect(authorization).toBe('Bearer gh-token');

    try {
      await repo.getById('owner/missing');
      throw new Error('expected throw');
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      if (isAppError(error)) {
        expect(error.code).toBe('not_found');
      }
    }

    try {
      await repo.getById('owner/secret');
      throw new Error('expected throw');
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      if (isAppError(error)) {
        expect(error.code).toBe('unauthorized');
      }
    }

    try {
      await repo.getById('owner/locked');
      throw new Error('expected throw');
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      if (isAppError(error)) {
        expect(error.code).toBe('forbidden');
      }
    }
  });

  describe('listTrending (EXP-13)', () => {
    it('calls search/repositories with created:> date, sort=stars, order=desc', async () => {
      let capturedUrl: URL | null = null;

      server.use(
        http.get('https://api.github.com/search/repositories', ({ request }) => {
          capturedUrl = new URL(request.url);
          return HttpResponse.json(searchFixture);
        }),
      );

      const repo = createGithubRepoRepository();
      const result = await repo.listTrending({ page: 1, perPage: 20 });

      expect(capturedUrl).not.toBeNull();
      const q = capturedUrl!.searchParams.get('q') ?? '';
      expect(q).toMatch(/^created:>\d{4}-\d{2}-\d{2}$/);
      expect(capturedUrl!.searchParams.get('sort')).toBe('stars');
      expect(capturedUrl!.searchParams.get('order')).toBe('desc');
      expect(capturedUrl!.searchParams.get('page')).toBe('1');
      expect(capturedUrl!.searchParams.get('per_page')).toBe('20');

      expect(result.items).toHaveLength(2);
      expect(result.items[0]?.id).toBe('facebook/react');
      expect(result.items[0]?.fullName).toBe('facebook/react');
      expect(result).not.toHaveProperty('totalCount');
    });

    it('hasNextPage follows search window cap rules', async () => {
      server.use(
        http.get('https://api.github.com/search/repositories', () => {
          return HttpResponse.json({
            total_count: 500,
            items: Array.from({ length: 20 }, (_, i) => ({
              full_name: `org/repo-${i}`,
              name: `repo-${i}`,
              description: 'x',
              stargazers_count: 1,
              forks_count: 0,
              watchers_count: 1,
              language: 'TS',
              owner: { login: 'org', avatar_url: 'https://a' },
              html_url: `https://github.com/org/repo-${i}`,
            })),
          });
        }),
      );

      const repo = createGithubRepoRepository();
      const result = await repo.listTrending({ page: 1, perPage: 20 });
      expect(result.hasNextPage).toBe(true);
    });

    it('sends Bearer token when configured for listTrending', async () => {
      let authorization: string | null = null;

      server.use(
        http.get('https://api.github.com/search/repositories', ({ request }) => {
          authorization = request.headers.get('Authorization');
          return HttpResponse.json({ total_count: 0, items: [] });
        }),
      );

      const repo = createGithubRepoRepository({ token: 'gh-trending' });
      await repo.listTrending({ page: 1 });

      expect(authorization).toBe('Bearer gh-trending');
    });
  });
});
