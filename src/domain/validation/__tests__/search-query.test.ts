import { isAppError } from '../../errors/app-error';
import { normalizeSearchQuery } from '../search-query';

describe('normalizeSearchQuery', () => {
  it('throws AppError empty_query for empty string', () => {
    expect(() => normalizeSearchQuery('')).toThrow();
    try {
      normalizeSearchQuery('');
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      expect(error).toMatchObject({ code: 'empty_query' });
    }
  });

  it('throws AppError empty_query for whitespace-only input', () => {
    expect(() => normalizeSearchQuery('   ')).toThrow();
    try {
      normalizeSearchQuery('   ');
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      expect(error).toMatchObject({ code: 'empty_query' });
    }
  });

  it('returns trimmed query for leading and trailing spaces', () => {
    expect(normalizeSearchQuery('  react  ')).toBe('react');
  });
});
