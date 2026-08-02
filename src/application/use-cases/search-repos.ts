import {
  assertPage,
  assertPerPage,
  normalizeSearchQuery,
  type PaginatedResult,
  type Repo,
  type RepoRepository,
} from '@/domain';

import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '../constants/pagination';

export type SearchReposInput = {
  query: string;
  page?: number;
  perPage?: number;
};

export type SearchRepos = (input: SearchReposInput) => Promise<PaginatedResult<Repo>>;

export function createSearchRepos(repository: RepoRepository): SearchRepos {
  return async (input) => {
    const query = normalizeSearchQuery(input.query);
    const page = input.page ?? DEFAULT_PAGE;
    const perPage = input.perPage ?? DEFAULT_PER_PAGE;
    assertPage(page);
    assertPerPage(perPage);

    return repository.search({ query, page, perPage });
  };
}
