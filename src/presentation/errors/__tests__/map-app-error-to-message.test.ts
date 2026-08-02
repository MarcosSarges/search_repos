import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { createAppError, type AppErrorCode } from '@/domain';

import { mapAppErrorToMessage } from '../map-app-error-to-message';

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

describe('mapAppErrorToMessage (PRES-13..16)', () => {
  it.each(ALL_CODES)('returns non-empty PT-BR string for AppError code %s', (code) => {
    const message = mapAppErrorToMessage(createAppError(code));
    expect(typeof message).toBe('string');
    expect(message.length).toBeGreaterThan(0);
    // Heuristic: Portuguese copy should not be the raw English code token alone
    expect(message).not.toBe(code);
  });

  it('returns the unknown copy for non-AppError values', () => {
    const unknownMessage = mapAppErrorToMessage(createAppError('unknown'));
    expect(mapAppErrorToMessage(new Error('boom'))).toBe(unknownMessage);
    expect(mapAppErrorToMessage('string-error')).toBe(unknownMessage);
    expect(mapAppErrorToMessage(null)).toBe(unknownMessage);
    expect(mapAppErrorToMessage(undefined)).toBe(unknownMessage);
    expect(mapAppErrorToMessage({ code: 'network' })).toBe(unknownMessage);
  });

  it('returns the same rate_limit string with or without cause', () => {
    const withoutCause = mapAppErrorToMessage(createAppError('rate_limit'));
    const withCause = mapAppErrorToMessage(
      createAppError('rate_limit', { retryAfterSeconds: 60 }),
    );
    expect(withCause).toBe(withoutCause);
    expect(withCause.length).toBeGreaterThan(0);
  });

  it('module source has no React, React Native, or TanStack Query imports', () => {
    const source = readFileSync(
      join(__dirname, '..', 'map-app-error-to-message.ts'),
      'utf8',
    );
    expect(source).not.toMatch(/from ['"]react['"]/);
    expect(source).not.toMatch(/from ['"]react-native['"]/);
    expect(source).not.toMatch(/@tanstack\/react-query/);
  });
});
