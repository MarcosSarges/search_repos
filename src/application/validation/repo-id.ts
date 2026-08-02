import { createAppError } from '@/domain';

export function normalizeRepoId(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw createAppError('invalid_input');
  }
  return trimmed;
}
