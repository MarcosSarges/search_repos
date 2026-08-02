import { createAppError } from '../errors/app-error';

export function normalizeSearchQuery(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw createAppError('empty_query');
  }
  return trimmed;
}
