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

export type CreateContainerDeps = {
  dataSource: DataSource;
  repository?: RepoRepository;
};

export type AppContainer = {
  searchRepos: SearchRepos;
  getRepoDetails: GetRepoDetails;
  listRepoIssues: ListRepoIssues;
};

export function createContainer(deps: CreateContainerDeps): AppContainer {
  const repository = deps.repository ?? resolveRepository(deps.dataSource);

  return {
    searchRepos: createSearchRepos(repository),
    getRepoDetails: createGetRepoDetails(repository),
    listRepoIssues: createListRepoIssues(repository),
  };
}
