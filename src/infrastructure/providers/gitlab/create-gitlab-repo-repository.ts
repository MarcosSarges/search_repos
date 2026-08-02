import type {
  Issue,
  ListIssuesInput,
  PaginatedResult,
  Repo,
  RepoRepository,
  SearchReposInput,
} from '@/domain';

import { resolveHasNextPage } from '../../http/resolve-has-next-page';
import { assertGitlabRepoId } from './assert-repo-id';
import type { GitlabApiClient } from './create-gitlab-api-client';
import { mapGitlabIssue, mapGitlabRepo } from './mappers';

export type CreateGitlabRepoRepositoryOptions = {
  client: GitlabApiClient;
};

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
  options: CreateGitlabRepoRepositoryOptions,
): RepoRepository {
  const { client } = options;

  return {
    async search(input: SearchReposInput): Promise<PaginatedResult<Repo>> {
      const perPage = input.perPage ?? 20;
      const page = input.page;
      const { data, headers } = await client.searchProjects({
        query: input.query,
        page,
        perPage,
      });
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
      const { data } = await client.getProject(repoId);
      return mapGitlabRepo(data);
    },

    async listIssues(input: ListIssuesInput): Promise<PaginatedResult<Issue>> {
      assertGitlabRepoId(input.repoId);
      const perPage = input.perPage ?? 20;
      const page = input.page;
      const { data, headers } = await client.listOpenedIssues(input.repoId, { page, perPage });
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
