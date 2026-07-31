import { createAppError, type Issue, type PaginatedResult, type RepoRepository } from '@/domain';

export type ListRepoIssuesInput = {
  repoId: string;
  page?: number;
  perPage?: number;
};

export type ListRepoIssuesUseCase = {
  execute: (input: ListRepoIssuesInput) => Promise<PaginatedResult<Issue>>;
};

export function createListRepoIssuesUseCase(repository: RepoRepository): ListRepoIssuesUseCase {
  return {
    async execute(input) {
      const repoId = input.repoId.trim();

      if (!repoId) {
        throw createAppError('not_found', 'Repository id is required');
      }

      return repository.listIssues({
        repoId,
        page: input.page ?? 1,
        perPage: input.perPage ?? 20,
      });
    },
  };
}
