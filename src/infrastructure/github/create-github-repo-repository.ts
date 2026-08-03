import type {
  ListIssuesInput,
  ListTrendingInput,
  PaginatedResult,
  Repo,
  RepoRepository,
  SearchReposInput,
  Issue,
} from '@/domain';

import { jsonFetch } from '../http/json-fetch';
import { hasRelNext } from '../http/parse-link-next';
import { resolveHasNextPage } from '../http/resolve-has-next-page';
import { getTrendingSinceDate } from '../trending/window';
import { assertGithubRepoId } from './assert-repo-id';
import { mapGithubIssue, mapGithubRepo } from './mappers';
import type { GithubIssueDto, GithubRepoDto, GithubSearchReposResponse } from './types';

const GITHUB_API_BASE = 'https://api.github.com';
const SEARCH_RESULT_WINDOW_CAP = 1000;

export type CreateGithubRepoRepositoryOptions = {
  token?: string;
};

function authInit(token?: string) {
  return token !== undefined
    ? { token, tokenHeader: 'bearer' as const }
    : ({} as { token?: string; tokenHeader?: 'bearer' });
}

/**
 * GitHub Anti-Corruption Layer implementing `RepoRepository`.
 */
export function createGithubRepoRepository(
  options: CreateGithubRepoRepositoryOptions = {},
): RepoRepository {
  const { token } = options;

  return {
    async search(input: SearchReposInput): Promise<PaginatedResult<Repo>> {
      const perPage = input.perPage ?? 20;
      const page = input.page;
      const url = new URL(`${GITHUB_API_BASE}/search/repositories`);
      url.searchParams.set('q', input.query);
      url.searchParams.set('sort', 'stars');
      url.searchParams.set('order', 'desc');
      url.searchParams.set('page', String(page));
      url.searchParams.set('per_page', String(perPage));

      const { data } = await jsonFetch<GithubSearchReposResponse>(url.toString(), authInit(token));
      const items = data.items.map(mapGithubRepo);
      const resolvedHasNext = page * perPage < Math.min(data.total_count, SEARCH_RESULT_WINDOW_CAP);

      return {
        items,
        page,
        perPage,
        hasNextPage: resolveHasNextPage({
          itemsLength: items.length,
          perPage,
          resolvedHasNext,
        }),
      };
    },

    async getById(repoId: string): Promise<Repo> {
      assertGithubRepoId(repoId);
      const { data } = await jsonFetch<GithubRepoDto>(
        `${GITHUB_API_BASE}/repos/${repoId}`,
        authInit(token),
      );
      return mapGithubRepo(data);
    },

    async listIssues(input: ListIssuesInput): Promise<PaginatedResult<Issue>> {
      assertGithubRepoId(input.repoId);
      const perPage = input.perPage ?? 20;
      const page = input.page;
      const url = new URL(`${GITHUB_API_BASE}/repos/${input.repoId}/issues`);
      url.searchParams.set('state', 'open');
      url.searchParams.set('page', String(page));
      url.searchParams.set('per_page', String(perPage));

      const { data, headers } = await jsonFetch<GithubIssueDto[]>(url.toString(), authInit(token));
      const items = data.filter((dto) => dto.pull_request == null).map(mapGithubIssue);
      const headerIndicatesNext = hasRelNext(headers.get('Link'));

      return {
        items,
        page,
        perPage,
        hasNextPage: resolveHasNextPage({
          itemsLength: items.length,
          perPage,
          headerIndicatesNext,
        }),
      };
    },

    async listTrending(input: ListTrendingInput): Promise<PaginatedResult<Repo>> {
      const perPage = input.perPage ?? 20;
      const page = input.page;
      const since = getTrendingSinceDate();
      const url = new URL(`${GITHUB_API_BASE}/search/repositories`);
      url.searchParams.set('q', `created:>${since}`);
      url.searchParams.set('sort', 'stars');
      url.searchParams.set('order', 'desc');
      url.searchParams.set('page', String(page));
      url.searchParams.set('per_page', String(perPage));

      const { data } = await jsonFetch<GithubSearchReposResponse>(url.toString(), authInit(token));
      const items = data.items.map(mapGithubRepo);
      const resolvedHasNext = page * perPage < Math.min(data.total_count, SEARCH_RESULT_WINDOW_CAP);

      return {
        items,
        page,
        perPage,
        hasNextPage: resolveHasNextPage({
          itemsLength: items.length,
          perPage,
          resolvedHasNext,
        }),
      };
    },
  };
}
