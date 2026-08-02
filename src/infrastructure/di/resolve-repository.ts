import type { DataSource } from '@/application';
import type { RepoRepository } from '@/domain';

import { createGithubApiClient } from '../github/create-github-api-client';
import { createGithubRepoRepository } from '../github/create-github-repo-repository';
import { createGitlabApiClient } from '../gitlab/create-gitlab-api-client';
import { createGitlabRepoRepository } from '../gitlab/create-gitlab-repo-repository';

export type ResolveRepositoryOptions = {
  token?: string;
  baseUrl?: string;
};

const factories: Record<DataSource, (options?: ResolveRepositoryOptions) => RepoRepository> = {
  github: (options) =>
    createGithubRepoRepository({
      client: createGithubApiClient({ token: options?.token, baseUrl: options?.baseUrl }),
    }),
  gitlab: (options) =>
    createGitlabRepoRepository({
      client: createGitlabApiClient({ token: options?.token, baseUrl: options?.baseUrl }),
    }),
};

/**
 * Resolves the runtime `RepoRepository` for a `DataSource` (HTTP adapters).
 * Fake is not in this map — import `createInMemoryRepoRepository` in tests only.
 */
export function resolveRepository(
  dataSource: DataSource,
  options?: ResolveRepositoryOptions,
): RepoRepository {
  return factories[dataSource](options);
}
