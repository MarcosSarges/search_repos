import { type Repo, type RepoRepository } from '@/domain';

import { normalizeRepoId } from '../validation/repo-id';

export type GetRepoDetailsInput = {
  repoId: string;
};

export type GetRepoDetails = (input: GetRepoDetailsInput) => Promise<Repo>;

export function createGetRepoDetails(repository: RepoRepository): GetRepoDetails {
  return async (input) => {
    const repoId = normalizeRepoId(input.repoId);
    return repository.getById(repoId);
  };
}
