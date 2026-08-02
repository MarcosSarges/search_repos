import { createAppError, type AppError } from '@/domain';

/** Structured cause attached to `rate_limit` errors (INFRA-19). */
export type RateLimitCause = {
  status: 429;
  /** Unix epoch seconds when present (GitHub `X-RateLimit-Reset`). */
  resetAtEpochSeconds?: number;
  /** Seconds to wait when present (`Retry-After`). */
  retryAfterSeconds?: number;
};

export function mapHttpStatus(status: number, cause?: unknown): AppError {
  switch (status) {
    case 401:
      return createAppError('unauthorized', cause);
    case 403:
      return createAppError('forbidden', cause);
    case 404:
      return createAppError('not_found', cause);
    case 429:
      return createAppError('rate_limit', cause);
    default:
      return createAppError('unknown', cause);
  }
}

function parsePositiveInt(value: string | null): number | undefined {
  if (value == null || value === '') {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function buildRateLimitCause(response: Response): RateLimitCause {
  const cause: RateLimitCause = { status: 429 };
  const resetAtEpochSeconds = parsePositiveInt(response.headers.get('X-RateLimit-Reset'));
  const retryAfterSeconds = parsePositiveInt(response.headers.get('Retry-After'));
  if (resetAtEpochSeconds !== undefined) {
    cause.resetAtEpochSeconds = resetAtEpochSeconds;
  }
  if (retryAfterSeconds !== undefined) {
    cause.retryAfterSeconds = retryAfterSeconds;
  }
  return cause;
}

export async function mapHttpResponseError(response: Response): Promise<AppError> {
  if (response.status === 429) {
    return mapHttpStatus(429, buildRateLimitCause(response));
  }
  return mapHttpStatus(response.status, { status: response.status });
}

function isAbortError(error: unknown): boolean {
  if (error == null || typeof error !== 'object') {
    return false;
  }
  const name = (error as { name?: string }).name;
  return name === 'AbortError';
}

export function mapFetchException(error: unknown): AppError {
  if (isAbortError(error)) {
    return createAppError('aborted', error);
  }
  return createAppError('network', error);
}
