import {
  assertPage,
  assertPerPage,
  type Issue,
  type PaginatedResult,
  type RepoRepository,
} from '@/domain';

import { DEFAULT_PAGE, DEFAULT_PER_PAGE } from '../constants/pagination';
import { normalizeRepoId } from '../validation/repo-id';

export type ListRepoIssuesInput = {
  repoId: string;
  page?: number;
  perPage?: number;
};

export type ListRepoIssues = (input: ListRepoIssuesInput) => Promise<PaginatedResult<Issue>>;

export function createListRepoIssues(repository: RepoRepository): ListRepoIssues {
  return async (input) => {
    const repoId = normalizeRepoId(input.repoId);
    const page = input.page ?? DEFAULT_PAGE;
    const perPage = input.perPage ?? DEFAULT_PER_PAGE;
    assertPage(page);
    assertPerPage(perPage);

    return repository.listIssues({ repoId, page, perPage });
  };
}
