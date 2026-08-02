import type { DataSource } from '@/application';
import type { RepoRepository } from '@/domain';

import { createGithubRepoRepository } from '../github/create-github-repo-repository';
import { createGitlabRepoRepository } from '../gitlab/create-gitlab-repo-repository';

export type ResolveRepositoryOptions = {
  token?: string;
};

const factories: Record<DataSource, (options?: ResolveRepositoryOptions) => RepoRepository> = {
  github: (options) => createGithubRepoRepository({ token: options?.token }),
  gitlab: (options) => createGitlabRepoRepository({ token: options?.token }),
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
