import {
  assertPage,
  assertPerPage,
  type PaginatedResult,
  type Repo,
  type RepoRepository,
} from '@/domain';

import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '../constants/pagination';

export type ListTrendingReposInput = {
  page?: number;
  perPage?: number;
};

export type ListTrendingRepos = (
  input?: ListTrendingReposInput,
) => Promise<PaginatedResult<Repo>>;

export function createListTrendingRepos(repository: RepoRepository): ListTrendingRepos {
  return async (input = {}) => {
    const page = input.page ?? DEFAULT_PAGE;
    const perPage = input.perPage ?? DEFAULT_PER_PAGE;
    assertPage(page);
    assertPerPage(perPage);

    return repository.listTrending({ page, perPage });
  };
}
