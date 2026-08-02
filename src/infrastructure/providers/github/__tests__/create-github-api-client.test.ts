import { http, HttpResponse } from 'msw';

import { server } from '@/test/msw/server';
import { useMswServer } from '@/test/msw/use-msw-server';

import { createGithubApiClient } from '../create-github-api-client';

describe('createGithubApiClient (CLI-01, CLI-06, CLI-07)', () => {
  useMswServer(server);

  it('defaults baseUrl to https://api.github.com and sends Bearer when token is set', async () => {
    let authorization: string | null = null;
    let requestUrl = '';

    server.use(
      http.get('*/search/repositories', ({ request }) => {
        authorization = request.headers.get('Authorization');
        requestUrl = request.url;
        return HttpResponse.json({ total_count: 0, items: [] });
      }),
    );

    const client = createGithubApiClient({ token: 'gh-secret' });
    await client.searchRepositories({ query: 'react', page: 1, perPage: 20 });

    expect(authorization).toBe('Bearer gh-secret');
    expect(new URL(requestUrl).origin).toBe('https://api.github.com');
    expect(new URL(requestUrl).pathname).toBe('/search/repositories');
  });

  it('omits Authorization when token is undefined', async () => {
    let sawAuthorization = false;

    server.use(
      http.get('*/search/repositories', ({ request }) => {
        sawAuthorization = request.headers.has('Authorization');
        return HttpResponse.json({ total_count: 0, items: [] });
      }),
    );

    const client = createGithubApiClient();
    await client.searchRepositories({ query: 'x', page: 1, perPage: 10 });

    expect(sawAuthorization).toBe(false);
  });

  it('uses custom baseUrl with URL join and is intercepted by path wildcards (CLI-07)', async () => {
    let requestUrl = '';
    let authorization: string | null = null;

    server.use(
      http.get('*/search/repositories', ({ request }) => {
        requestUrl = request.url;
        authorization = request.headers.get('Authorization');
        return HttpResponse.json({ total_count: 0, items: [] });
      }),
      http.get('*/repos/:owner/:repo', ({ request }) => {
        requestUrl = request.url;
        return HttpResponse.json({
          full_name: 'acme/app',
          name: 'app',
          stargazers_count: 1,
          forks_count: 0,
          owner: { login: 'acme' },
          html_url: 'https://gh.empresa.test/acme/app',
        });
      }),
    );

    const client = createGithubApiClient({
      baseUrl: 'https://gh.empresa.test',
      token: 'enterprise',
    });

    await client.searchRepositories({ query: 'app', page: 1, perPage: 5 });
    expect(new URL(requestUrl).origin).toBe('https://gh.empresa.test');
    expect(new URL(requestUrl).pathname).toBe('/search/repositories');
    expect(authorization).toBe('Bearer enterprise');

    await client.getRepository('acme/app');
    expect(new URL(requestUrl).href).toBe('https://gh.empresa.test/repos/acme/app');
  });
});
