import {
  createGetRepoDetails,
  createListRepoIssues,
  createSearchRepos,
  type DataSource,
  type GetRepoDetails,
  type ListRepoIssues,
  type SearchRepos,
} from '@/application';
import type { RepoRepository } from '@/domain';

import { resolveRepository } from './resolve-repository';

export type ProviderTokens = {
  github?: string;
  gitlab?: string;
};

export type ProviderHosts = {
  github?: string;
  gitlab?: string;
};

export type CreateContainerDeps = {
  dataSource: DataSource;
  repository?: RepoRepository;
  /** Optional credentials bag — DI selects token for active dataSource. */
  tokens?: ProviderTokens;
  /** Optional API host bag — DI selects baseUrl for active dataSource. */
  hosts?: ProviderHosts;
};

export type AppContainer = {
  searchRepos: SearchRepos;
  getRepoDetails: GetRepoDetails;
  listRepoIssues: ListRepoIssues;
};

export function createContainer(deps: CreateContainerDeps): AppContainer {
  const token = deps.tokens?.[deps.dataSource];
  const baseUrl = deps.hosts?.[deps.dataSource];
  const repository = deps.repository ?? resolveRepository(deps.dataSource, { token, baseUrl });

  return {
    searchRepos: createSearchRepos(repository),
    getRepoDetails: createGetRepoDetails(repository),
    listRepoIssues: createListRepoIssues(repository),
  };
}
