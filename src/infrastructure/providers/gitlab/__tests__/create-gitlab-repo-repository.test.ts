import { http, HttpResponse } from 'msw';

import { isAppError } from '@/domain';
import { server } from '@/test/msw/server';
import { useMswServer } from '@/test/msw/use-msw-server';
import searchFixture from '@/test/msw/fixtures/gitlab/search-projects.json';
import projectDetailFixture from '@/test/msw/fixtures/gitlab/project-detail.json';
import issuesFixture from '@/test/msw/fixtures/gitlab/issues.json';

import { createGitlabApiClient } from '../create-gitlab-api-client';
import { createGitlabRepoRepository } from '../create-gitlab-repo-repository';

function createRepo(options?: { token?: string; baseUrl?: string }) {
  return createGitlabRepoRepository({
    client: createGitlabApiClient(options),
  });
}

describe('createGitlabRepoRepository', () => {
  useMswServer(server);

  it('search maps projects to Repo with numeric-string id and no totalCount', async () => {
    server.use(
      http.get('*/api/v4/projects', ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('order_by')).toBe('star_count');
        expect(url.searchParams.get('sort')).toBe('desc');
        return HttpResponse.json(searchFixture);
      }),
    );

    const repo = createRepo();
    const result = await repo.search({ query: 'gitlab', page: 1, perPage: 20 });

    expect(result.items).toHaveLength(2);
    expect(result.items[0]?.id).toBe('278964');
    expect(result.items[0]?.fullName).toBe('gitlab-org/gitlab');
    expect(result.items[1]?.id).toBe('13083');
    expect(result.items[1]?.description).toBeUndefined();
    expect(result.items[1]?.language).toBeUndefined();
    expect(result.items[1]?.ownerAvatarUrl).toBeUndefined();
    expect(result.items[1]?.watchers).toBe(0);
    expect(result.page).toBe(1);
    expect(result.perPage).toBe(20);
    expect(result).not.toHaveProperty('totalCount');
  });

  it('search uses X-Next-Page header for hasNextPage when present', async () => {
    server.use(
      http.get('*/api/v4/projects', () => {
        return HttpResponse.json(searchFixture, {
          headers: { 'X-Next-Page': '2' },
        });
      }),
    );

    const repo = createRepo();
    const result = await repo.search({ query: 'gitlab', page: 1, perPage: 20 });
    expect(result.hasNextPage).toBe(true);
  });

  it('search falls back to items.length === perPage when X-Next-Page absent', async () => {
    const fullPage = Array.from({ length: 2 }, (_, i) => ({
      id: i + 1,
      name: `repo-${i}`,
      path_with_namespace: `org/repo-${i}`,
      description: 'x',
      star_count: 1,
      forks_count: 0,
      namespace: { name: 'org', avatar_url: 'https://a' },
      web_url: `https://gitlab.com/org/repo-${i}`,
    }));

    server.use(
      http.get('*/api/v4/projects', () => {
        return HttpResponse.json(fullPage);
      }),
    );

    const repo = createRepo();
    const result = await repo.search({ query: 'x', page: 1, perPage: 2 });
    expect(result.hasNextPage).toBe(true);
  });

  it('getById / listIssues reject non-numeric repoId without HTTP', async () => {
    let httpHits = 0;
    server.use(
      http.get('https://gitlab.com/api/v4/*', () => {
        httpHits += 1;
        return HttpResponse.json({});
      }),
    );

    const repo = createRepo();

    try {
      await repo.getById('vuejs/vue');
      throw new Error('expected throw');
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      if (isAppError(error)) {
        expect(error.code).toBe('invalid_input');
      }
    }

    try {
      await repo.listIssues({ repoId: 'owner/repo', page: 1 });
      throw new Error('expected throw');
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      if (isAppError(error)) {
        expect(error.code).toBe('invalid_input');
      }
    }

    expect(httpHits).toBe(0);
  });

  it('getById maps project detail with undefined for null description', async () => {
    server.use(
      http.get('*/api/v4/projects/278964', () => {
        return HttpResponse.json(projectDetailFixture);
      }),
    );

    const repo = createRepo();
    const detail = await repo.getById('278964');

    expect(detail.id).toBe('278964');
    expect(detail.description).toBeUndefined();
    expect(detail.fullName).toBe('gitlab-org/gitlab');
    expect(detail.ownerName).toBe('gitlab-org');
    expect(detail.language).toBeUndefined();
    expect(detail.watchers).toBe(0);
  });

  it('listIssues maps opened issues and uses X-Next-Page for hasNextPage', async () => {
    server.use(
      http.get('*/api/v4/projects/278964/issues', ({ request }) => {
        const url = new URL(request.url);
        expect(url.searchParams.get('state')).toBe('opened');
        return HttpResponse.json(issuesFixture, {
          headers: { 'X-Next-Page': '2' },
        });
      }),
    );

    const repo = createRepo();
    const result = await repo.listIssues({
      repoId: '278964',
      page: 1,
      perPage: 20,
    });

    expect(result.items).toHaveLength(2);
    expect(result.items[0]?.id).toBe('1');
    expect(result.items[0]?.number).toBe(10);
    expect(result.items[0]?.labels).toEqual([
      { id: 'bug', name: 'bug', color: undefined },
      { id: 'priority', name: 'priority', color: undefined },
    ]);
    expect(result.items[1]?.authorAvatarUrl).toBeUndefined();
    expect(result.hasNextPage).toBe(true);
  });

  it('listIssues empty page yields hasNextPage false', async () => {
    server.use(
      http.get('*/api/v4/projects/278964/issues', () => {
        return HttpResponse.json([]);
      }),
    );

    const repo = createRepo();
    const result = await repo.listIssues({
      repoId: '278964',
      page: 1,
      perPage: 20,
    });

    expect(result.items).toEqual([]);
    expect(result.hasNextPage).toBe(false);
  });

  it('sends Authorization Bearer when configured and maps HTTP errors', async () => {
    let authorization: string | null = null;
    let privateToken: string | null = null;

    server.use(
      http.get('*/api/v4/projects', ({ request }) => {
        authorization = request.headers.get('Authorization');
        privateToken = request.headers.get('PRIVATE-TOKEN');
        return new HttpResponse(null, {
          status: 429,
          headers: { 'Retry-After': '60' },
        });
      }),
      http.get('*/api/v4/projects/404', () => {
        return new HttpResponse(null, { status: 404 });
      }),
      http.get('*/api/v4/projects/401', () => {
        return new HttpResponse(null, { status: 401 });
      }),
      http.get('*/api/v4/projects/403', () => {
        return new HttpResponse(null, { status: 403 });
      }),
    );

    const repo = createRepo({ token: 'gl-token' });

    try {
      await repo.search({ query: 'x', page: 1 });
      throw new Error('expected throw');
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      if (isAppError(error)) {
        expect(error.code).toBe('rate_limit');
        expect(error.cause).toEqual({
          status: 429,
          retryAfterSeconds: 60,
        });
      }
    }
    expect(authorization).toBe('Bearer gl-token');
    expect(privateToken).toBeNull();

    try {
      await repo.getById('404');
      throw new Error('expected throw');
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      if (isAppError(error)) {
        expect(error.code).toBe('not_found');
      }
    }

    try {
      await repo.getById('401');
      throw new Error('expected throw');
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      if (isAppError(error)) {
        expect(error.code).toBe('unauthorized');
      }
    }

    try {
      await repo.getById('403');
      throw new Error('expected throw');
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      if (isAppError(error)) {
        expect(error.code).toBe('forbidden');
      }
    }
  });

  it('WHEN custom root host is set THEN ACL search maps via /api/v4 normalize + wildcards', async () => {
    server.use(
      http.get('*/api/v4/projects', () => {
        return HttpResponse.json(searchFixture);
      }),
    );

    const repo = createRepo({ baseUrl: 'https://gitlab.empresa.com/' });
    const result = await repo.search({ query: 'gitlab', page: 1, perPage: 20 });

    expect(result.items[0]?.id).toBe('278964');
    expect(result).not.toHaveProperty('totalCount');
  });
});
