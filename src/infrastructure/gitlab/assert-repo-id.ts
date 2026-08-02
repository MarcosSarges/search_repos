import { createAppError } from '@/domain';

const NUMERIC_REPO_ID = /^\d+$/;

/**
 * Fail Fast: GitLab repoId must be a numeric string (project id).
 */
export function assertGitlabRepoId(repoId: string): void {
  if (!NUMERIC_REPO_ID.test(repoId)) {
    throw createAppError('invalid_input', { repoId });
  }
}
