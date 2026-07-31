import {
  createAppError,
  type PaginatedResult,
  type Repo,
  type RepoRepository,
} from '@/domain';

export type SearchReposInput = {
  query: string;
  page?: number;
  perPage?: number;
};

export type SearchReposUseCase = {
  execute: (input: SearchReposInput) => Promise<PaginatedResult<Repo>>;
};

export function createSearchReposUseCase(repository: RepoRepository): SearchReposUseCase {
  return {
    async execute(input) {
      const query = input.query.trim();

      if (!query) {
        throw createAppError('empty_query', 'Search query must not be empty');
      }

      return repository.search({
        query,
        page: input.page ?? 1,
        perPage: input.perPage ?? 20,
      });
    },
  };
}
