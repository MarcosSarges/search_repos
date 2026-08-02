import type { AppError } from '@/domain';

import { normalizeRepoId } from '../repo-id';

describe('normalizeRepoId', () => {
  it('rejects empty string with invalid_input', () => {
    expect(() => normalizeRepoId('')).toThrow(
      expect.objectContaining({ code: 'invalid_input' } satisfies Partial<AppError>),
    );
  });

  it('rejects whitespace-only with invalid_input', () => {
    expect(() => normalizeRepoId('   ')).toThrow(
      expect.objectContaining({ code: 'invalid_input' } satisfies Partial<AppError>),
    );
  });

  it('returns trimmed id', () => {
    expect(normalizeRepoId('  a/b  ')).toBe('a/b');
  });
});
