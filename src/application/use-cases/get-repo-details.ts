import { createAppError, type Repo, type RepoRepository } from '@/domain';

export type GetRepoDetailsInput = {
  repoId: string;
};

export type GetRepoDetailsUseCase = {
  execute: (input: GetRepoDetailsInput) => Promise<Repo>;
};

export function createGetRepoDetailsUseCase(repository: RepoRepository): GetRepoDetailsUseCase {
  return {
    async execute(input) {
      const repoId = input.repoId.trim();

      if (!repoId) {
        throw createAppError('not_found');
      }

      return repository.getById(repoId);
    },
  };
}
