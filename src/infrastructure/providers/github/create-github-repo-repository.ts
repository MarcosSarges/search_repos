import type {
  ListIssuesInput,
  PaginatedResult,
  Repo,
  RepoRepository,
  SearchReposInput,
  Issue,
} from '@/domain';

import { hasRelNext } from '../../http/parse-link-next';
import { resolveHasNextPage } from '../../http/resolve-has-next-page';
import { assertGithubRepoId } from './assert-repo-id';
import type { GithubApiClient } from './create-github-api-client';
import { mapGithubIssue, mapGithubRepo } from './mappers';

const SEARCH_RESULT_WINDOW_CAP = 1000;

export type CreateGithubRepoRepositoryOptions = {
  client: GithubApiClient;
};

/**
 * GitHub Anti-Corruption Layer implementing `RepoRepository`.
 */
export function createGithubRepoRepository(
  options: CreateGithubRepoRepositoryOptions,
): RepoRepository {
  const { client } = options;

  return {
    async search(input: SearchReposInput): Promise<PaginatedResult<Repo>> {
      const perPage = input.perPage ?? 20;
      const page = input.page;
      const { data } = await client.searchRepositories({
        query: input.query,
        page,
        perPage,
      });
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
      const { data } = await client.getRepository(repoId);
      return mapGithubRepo(data);
    },

    async listIssues(input: ListIssuesInput): Promise<PaginatedResult<Issue>> {
      assertGithubRepoId(input.repoId);
      const perPage = input.perPage ?? 20;
      const page = input.page;
      const { data, headers } = await client.listOpenIssues(input.repoId, { page, perPage });
      const items = data.map(mapGithubIssue);
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
  };
}
