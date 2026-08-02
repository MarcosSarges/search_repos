import type { Issue } from '../entities/issue';
import type { PaginatedResult } from '../entities/pagination';
import type { Repo } from '../entities/repo';

export type SearchReposInput = {
  query: string;
  /** 1-based page index (page `1` is the first page). */
  page: number;
  perPage?: number;
};

export type ListIssuesInput = {
  /** Opaque non-empty repository identity string. */
  repoId: string;
  /** 1-based page index (page `1` is the first page). */
  page: number;
  perPage?: number;
};

/**
 * Provider-agnostic repository port.
 *
 * Implementations SHALL reject failed operations with `AppError` (callers may rely on `isAppError`).
 * `page` is 1-based. `repoId` is an opaque non-empty string.
 */
export type RepoRepository = {
  search: (input: SearchReposInput) => Promise<PaginatedResult<Repo>>;
  getById: (repoId: string) => Promise<Repo>;
  listIssues: (input: ListIssuesInput) => Promise<PaginatedResult<Issue>>;
};
