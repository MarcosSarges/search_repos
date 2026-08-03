import {
  createGetRepoDetails,
  createListRepoIssues,
  createListTrendingRepos,
  createSearchRepos,
  type DataSource,
  type GetRepoDetails,
  type ListRepoIssues,
  type ListTrendingRepos,
  type SearchRepos,
} from '@/application';
import type { RepoRepository } from '@/domain';

import { resolveRepository } from './resolve-repository';

export type ProviderTokens = {
  github?: string;
  gitlab?: string;
};

export type CreateContainerDeps = {
  dataSource: DataSource;
  repository?: RepoRepository;
  /** Optional credentials bag — DI selects token for active dataSource. */
  tokens?: ProviderTokens;
};

export type AppContainer = {
  searchRepos: SearchRepos;
  getRepoDetails: GetRepoDetails;
  listRepoIssues: ListRepoIssues;
  listTrendingRepos: ListTrendingRepos;
};

export function createContainer(deps: CreateContainerDeps): AppContainer {
  const token = deps.tokens?.[deps.dataSource];
  const repository = deps.repository ?? resolveRepository(deps.dataSource, { token });

  return {
    searchRepos: createSearchRepos(repository),
    getRepoDetails: createGetRepoDetails(repository),
    listRepoIssues: createListRepoIssues(repository),
    listTrendingRepos: createListTrendingRepos(repository),
  };
}
