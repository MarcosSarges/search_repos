import { http, HttpResponse } from 'msw';

import { server } from '@/test/msw/server';
import { useMswServer } from '@/test/msw/use-msw-server';

import { createGitlabApiClient } from '../create-gitlab-api-client';

describe('createGitlabApiClient (CLI-02, CLI-03, CLI-06, CLI-07)', () => {
  useMswServer(server);

  it('defaults to normalized https://gitlab.com/api/v4 and sends Bearer only', async () => {
    let authorization: string | null = null;
    let privateToken: string | null = null;
    let requestUrl = '';

    server.use(
      http.get('*/api/v4/projects', ({ request }) => {
        authorization = request.headers.get('Authorization');
        privateToken = request.headers.get('PRIVATE-TOKEN');
        requestUrl = request.url;
        return HttpResponse.json([]);
      }),
    );

    const client = createGitlabApiClient({ token: 'gl-secret' });
    await client.searchProjects({ query: 'x', page: 1, perPage: 20 });

    expect(authorization).toBe('Bearer gl-secret');
    expect(privateToken).toBeNull();
    expect(new URL(requestUrl).origin).toBe('https://gitlab.com');
    expect(new URL(requestUrl).pathname).toBe('/api/v4/projects');
  });

  it('omits Authorization when token is undefined', async () => {
    let sawAuthorization = false;

    server.use(
      http.get('*/api/v4/projects', ({ request }) => {
        sawAuthorization = request.headers.has('Authorization');
        return HttpResponse.json([]);
      }),
    );

    await createGitlabApiClient().searchProjects({ query: 'x', page: 1, perPage: 10 });
    expect(sawAuthorization).toBe(false);
  });

  it('normalizes custom root host to /api/v4 and matches via wildcards (CLI-03, CLI-07)', async () => {
    let requestUrl = '';

    server.use(
      http.get('*/api/v4/projects', ({ request }) => {
        requestUrl = request.url;
        return HttpResponse.json([]);
      }),
      http.get('*/api/v4/projects/:id', ({ request }) => {
        requestUrl = request.url;
        return HttpResponse.json({
          id: 1,
          name: 'app',
          path_with_namespace: 'acme/app',
          star_count: 1,
          forks_count: 0,
          web_url: 'https://gitlab.empresa.com/acme/app',
        });
      }),
    );

    const client = createGitlabApiClient({
      baseUrl: 'https://gitlab.empresa.com',
      token: 'enterprise',
    });

    await client.searchProjects({ query: 'app', page: 1, perPage: 5 });
    expect(new URL(requestUrl).href.startsWith('https://gitlab.empresa.com/api/v4/projects')).toBe(
      true,
    );

    await client.getProject('1');
    expect(new URL(requestUrl).href).toBe('https://gitlab.empresa.com/api/v4/projects/1');
  });

  it('does not duplicate /api/v4 when custom base already includes it', async () => {
    let requestUrl = '';

    server.use(
      http.get('*/api/v4/projects', ({ request }) => {
        requestUrl = request.url;
        return HttpResponse.json([]);
      }),
    );

    const client = createGitlabApiClient({
      baseUrl: 'https://gitlab.empresa.com/api/v4/',
    });
    await client.searchProjects({ query: 'x', page: 1, perPage: 1 });

    expect(new URL(requestUrl).pathname).toBe('/api/v4/projects');
    expect(requestUrl).not.toContain('/api/v4/api/v4');
  });
});
