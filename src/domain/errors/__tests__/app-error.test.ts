import { createAppError, isAppError, type AppErrorCode } from '../app-error';

const ALL_CODES: AppErrorCode[] = [
  'rate_limit',
  'network',
  'not_found',
  'empty_query',
  'invalid_input',
  'unauthorized',
  'forbidden',
  'aborted',
  'unknown',
];

describe('createAppError', () => {
  it.each(ALL_CODES)('returns AppError with code %s and Error.message equal to code', (code) => {
    const error = createAppError(code);

    expect(error.name).toBe('AppError');
    expect(error.code).toBe(code);
    expect(error.message).toBe(code);
    expect(error.cause).toBeUndefined();
  });

  it('preserves cause when provided', () => {
    const cause = new Error('upstream');
    const error = createAppError('network', cause);

    expect(error.code).toBe('network');
    expect(error.cause).toBe(cause);
  });

  it('preserves cause for unauthorized, forbidden, and aborted', () => {
    const cause = { status: 401 };
    expect(createAppError('unauthorized', cause).cause).toBe(cause);
    expect(createAppError('forbidden', cause).cause).toBe(cause);
    expect(createAppError('aborted', cause).cause).toBe(cause);
  });

  it('AppErrorCode set includes unauthorized, forbidden, aborted and has exactly nine codes', () => {
    expect(ALL_CODES).toEqual([
      'rate_limit',
      'network',
      'not_found',
      'empty_query',
      'invalid_input',
      'unauthorized',
      'forbidden',
      'aborted',
      'unknown',
    ]);
    expect(ALL_CODES).toHaveLength(9);
  });
});

describe('isAppError', () => {
  it('returns true for values created by createAppError', () => {
    expect(isAppError(createAppError('not_found'))).toBe(true);
  });

  it('returns true for the new unauthorized, forbidden, and aborted codes', () => {
    expect(isAppError(createAppError('unauthorized'))).toBe(true);
    expect(isAppError(createAppError('forbidden'))).toBe(true);
    expect(isAppError(createAppError('aborted'))).toBe(true);
  });

  it('returns false for unknown non-Error values', () => {
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
    expect(isAppError({ code: 'network' })).toBe(false);
    expect(isAppError('rate_limit')).toBe(false);
  });

  it('returns false for plain Error instances', () => {
    expect(isAppError(new Error('not_found'))).toBe(false);
  });
});
