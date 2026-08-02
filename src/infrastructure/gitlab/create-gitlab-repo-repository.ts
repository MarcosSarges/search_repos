import type {
  Issue,
  ListIssuesInput,
  PaginatedResult,
  Repo,
  RepoRepository,
  SearchReposInput,
} from '@/domain';

import { jsonFetch } from '../http/json-fetch';
import { resolveHasNextPage } from '../http/resolve-has-next-page';
import { assertGitlabRepoId } from './assert-repo-id';
import { mapGitlabIssue, mapGitlabRepo } from './mappers';
import type { GitlabIssueDto, GitlabProjectDto } from './types';

const GITLAB_API_BASE = 'https://gitlab.com/api/v4';

export type CreateGitlabRepoRepositoryOptions = {
  token?: string;
};

function authInit(token?: string) {
  return token !== undefined
    ? { token, tokenHeader: 'private-token' as const }
    : ({} as { token?: string; tokenHeader?: 'private-token' });
}

function headerIndicatesNext(headers: Headers): boolean | undefined {
  const nextPage = headers.get('X-Next-Page');
  if (nextPage === null) {
    return undefined;
  }
  return nextPage.trim() !== '';
}

/**
 * GitLab Anti-Corruption Layer implementing `RepoRepository`.
 */
export function createGitlabRepoRepository(
  options: CreateGitlabRepoRepositoryOptions = {},
): RepoRepository {
  const { token } = options;

  return {
    async search(input: SearchReposInput): Promise<PaginatedResult<Repo>> {
      const perPage = input.perPage ?? 20;
      const page = input.page;
      const url = new URL(`${GITLAB_API_BASE}/projects`);
      url.searchParams.set('search', input.query);
      url.searchParams.set('order_by', 'star_count');
      url.searchParams.set('sort', 'desc');
      url.searchParams.set('page', String(page));
      url.searchParams.set('per_page', String(perPage));

      const { data, headers } = await jsonFetch<GitlabProjectDto[]>(
        url.toString(),
        authInit(token),
      );
      const items = data.map(mapGitlabRepo);

      return {
        items,
        page,
        perPage,
        hasNextPage: resolveHasNextPage({
          itemsLength: items.length,
          perPage,
          headerIndicatesNext: headerIndicatesNext(headers),
        }),
      };
    },

    async getById(repoId: string): Promise<Repo> {
      assertGitlabRepoId(repoId);
      const { data } = await jsonFetch<GitlabProjectDto>(
        `${GITLAB_API_BASE}/projects/${repoId}`,
        authInit(token),
      );
      return mapGitlabRepo(data);
    },

    async listIssues(input: ListIssuesInput): Promise<PaginatedResult<Issue>> {
      assertGitlabRepoId(input.repoId);
      const perPage = input.perPage ?? 20;
      const page = input.page;
      const url = new URL(`${GITLAB_API_BASE}/projects/${input.repoId}/issues`);
      url.searchParams.set('state', 'opened');
      url.searchParams.set('page', String(page));
      url.searchParams.set('per_page', String(perPage));

      const { data, headers } = await jsonFetch<GitlabIssueDto[]>(url.toString(), authInit(token));
      const items = data.map(mapGitlabIssue);

      return {
        items,
        page,
        perPage,
        hasNextPage: resolveHasNextPage({
          itemsLength: items.length,
          perPage,
          headerIndicatesNext: headerIndicatesNext(headers),
        }),
      };
    },
  };
}
