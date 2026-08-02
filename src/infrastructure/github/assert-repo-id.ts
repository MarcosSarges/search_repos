import { createAppError } from '@/domain';

/**
 * Fail Fast: GitHub repoId must be `owner/repo` (contain `/`).
 */
export function assertGithubRepoId(repoId: string): void {
  if (!repoId.includes('/')) {
    throw createAppError('invalid_input', { repoId });
  }
}
