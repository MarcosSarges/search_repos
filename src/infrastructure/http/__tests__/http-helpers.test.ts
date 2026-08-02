import { isAppError } from '@/domain';

import {
  mapFetchException,
  mapHttpResponseError,
  mapHttpStatus,
  type RateLimitCause,
} from '../map-http-failure';
import { hasRelNext } from '../parse-link-next';
import { resolveHasNextPage } from '../resolve-has-next-page';

describe('mapHttpStatus', () => {
  it('maps 401 to unauthorized', () => {
    const error = mapHttpStatus(401);
    expect(isAppError(error)).toBe(true);
    expect(error.code).toBe('unauthorized');
  });

  it('maps 403 to forbidden', () => {
    expect(mapHttpStatus(403).code).toBe('forbidden');
  });

  it('maps 404 to not_found', () => {
    expect(mapHttpStatus(404).code).toBe('not_found');
  });

  it('maps 429 to rate_limit', () => {
    expect(mapHttpStatus(429).code).toBe('rate_limit');
  });

  it('maps other statuses to unknown', () => {
    expect(mapHttpStatus(500).code).toBe('unknown');
    expect(mapHttpStatus(418).code).toBe('unknown');
  });
});

describe('mapHttpResponseError', () => {
  it('maps 429 with X-RateLimit-Reset to rate_limit and structured cause', async () => {
    const response = new Response(null, {
      status: 429,
      headers: { 'X-RateLimit-Reset': '1700000000' },
    });

    const error = await mapHttpResponseError(response);
    expect(isAppError(error)).toBe(true);
    expect(error.code).toBe('rate_limit');

    const cause = error.cause as RateLimitCause;
    expect(cause).toEqual({
      status: 429,
      resetAtEpochSeconds: 1700000000,
    });
  });

  it('maps 429 with Retry-After to rate_limit and retryAfterSeconds', async () => {
    const response = new Response(null, {
      status: 429,
      headers: { 'Retry-After': '60' },
    });

    const error = await mapHttpResponseError(response);
    expect(error.code).toBe('rate_limit');
    expect(error.cause).toEqual({
      status: 429,
      retryAfterSeconds: 60,
    });
  });

  it('maps 429 with both reset and retry headers', async () => {
    const response = new Response(null, {
      status: 429,
      headers: {
        'X-RateLimit-Reset': '1700000000',
        'Retry-After': '30',
      },
    });

    const error = await mapHttpResponseError(response);
    expect(error.cause).toEqual({
      status: 429,
      resetAtEpochSeconds: 1700000000,
      retryAfterSeconds: 30,
    });
  });

  it('maps 401/403/404 via response to matching codes', async () => {
    expect((await mapHttpResponseError(new Response(null, { status: 401 }))).code).toBe(
      'unauthorized',
    );
    expect((await mapHttpResponseError(new Response(null, { status: 403 }))).code).toBe(
      'forbidden',
    );
    expect((await mapHttpResponseError(new Response(null, { status: 404 }))).code).toBe(
      'not_found',
    );
  });
});

describe('mapFetchException', () => {
  it('maps AbortError to aborted', () => {
    const abortError = new DOMException('The operation was aborted.', 'AbortError');
    const error = mapFetchException(abortError);
    expect(isAppError(error)).toBe(true);
    expect(error.code).toBe('aborted');
    expect(error.cause).toBe(abortError);
  });

  it('maps Error named AbortError to aborted', () => {
    const abortError = new Error('aborted');
    abortError.name = 'AbortError';
    expect(mapFetchException(abortError).code).toBe('aborted');
  });

  it('maps other fetch failures to network', () => {
    const networkError = new TypeError('Failed to fetch');
    const error = mapFetchException(networkError);
    expect(error.code).toBe('network');
    expect(error.cause).toBe(networkError);
  });
});

describe('hasRelNext', () => {
  it('returns true when Link header contains rel="next"', () => {
    const link =
      '<https://api.github.com/resource?page=2>; rel="next", <https://api.github.com/resource?page=5>; rel="last"';
    expect(hasRelNext(link)).toBe(true);
  });

  it('returns false when Link has no rel=next or is null', () => {
    expect(hasRelNext('<https://api.github.com/resource?page=1>; rel="prev"')).toBe(false);
    expect(hasRelNext(null)).toBe(false);
  });
});

describe('resolveHasNextPage', () => {
  it('returns false when itemsLength is 0', () => {
    expect(resolveHasNextPage({ itemsLength: 0, perPage: 20, headerIndicatesNext: true })).toBe(
      false,
    );
    expect(resolveHasNextPage({ itemsLength: 0, perPage: 20, resolvedHasNext: true })).toBe(false);
  });

  it('uses resolvedHasNext when defined (wins over headers/length)', () => {
    expect(
      resolveHasNextPage({
        itemsLength: 20,
        perPage: 20,
        headerIndicatesNext: true,
        resolvedHasNext: false,
      }),
    ).toBe(false);
    expect(
      resolveHasNextPage({
        itemsLength: 10,
        perPage: 20,
        headerIndicatesNext: false,
        resolvedHasNext: true,
      }),
    ).toBe(true);
  });

  it('uses headerIndicatesNext when resolvedHasNext is undefined', () => {
    expect(resolveHasNextPage({ itemsLength: 20, perPage: 20, headerIndicatesNext: false })).toBe(
      false,
    );
    expect(resolveHasNextPage({ itemsLength: 10, perPage: 20, headerIndicatesNext: true })).toBe(
      true,
    );
  });

  it('falls back to itemsLength === perPage when no header or resolved flag', () => {
    expect(resolveHasNextPage({ itemsLength: 20, perPage: 20 })).toBe(true);
    expect(resolveHasNextPage({ itemsLength: 5, perPage: 20 })).toBe(false);
  });

  it('input type has no totalCount field', () => {
    const input = { itemsLength: 10, perPage: 20 };
    expect('totalCount' in input).toBe(false);
    expect(Object.keys(input).some((k) => k.toLowerCase().includes('totalcount'))).toBe(false);
  });
});
