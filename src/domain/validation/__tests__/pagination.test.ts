import { isAppError } from '../../errors/app-error';
import { assertPage, assertPerPage } from '../pagination';

describe('assertPage', () => {
  it('throws AppError invalid_input when page is 0', () => {
    expect(() => assertPage(0)).toThrow();
    try {
      assertPage(0);
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      expect(error).toMatchObject({ code: 'invalid_input' });
    }
  });

  it('throws AppError invalid_input when page is negative', () => {
    expect(() => assertPage(-1)).toThrow();
    try {
      assertPage(-1);
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      expect(error).toMatchObject({ code: 'invalid_input' });
    }
  });

  it('does not throw when page is >= 1', () => {
    expect(() => assertPage(1)).not.toThrow();
    expect(() => assertPage(2)).not.toThrow();
  });
});

describe('assertPerPage', () => {
  it('throws AppError invalid_input when present perPage is < 1', () => {
    expect(() => assertPerPage(0)).toThrow();
    try {
      assertPerPage(0);
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      expect(error).toMatchObject({ code: 'invalid_input' });
    }
  });

  it('does not throw when perPage is undefined', () => {
    expect(() => assertPerPage(undefined)).not.toThrow();
  });

  it('does not throw when perPage is >= 1', () => {
    expect(() => assertPerPage(1)).not.toThrow();
    expect(() => assertPerPage(20)).not.toThrow();
  });
});
