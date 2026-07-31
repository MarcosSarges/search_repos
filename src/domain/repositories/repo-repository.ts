import type { Issue } from '../entities/issue';
import type { PaginatedResult } from '../entities/pagination';
import type { Repo } from '../entities/repo';

export type SearchReposInput = {
  query: string;
  page: number;
  perPage?: number;
};

export type ListIssuesInput = {
  repoId: string;
  page: number;
  perPage?: number;
};

export type RepoRepository = {
  search: (input: SearchReposInput) => Promise<PaginatedResult<Repo>>;
  getById: (repoId: string) => Promise<Repo>;
  listIssues: (input: ListIssuesInput) => Promise<PaginatedResult<Issue>>;
};
