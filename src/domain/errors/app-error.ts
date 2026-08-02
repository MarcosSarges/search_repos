export type AppErrorCode =
  'rate_limit' | 'network' | 'not_found' | 'empty_query' | 'invalid_input' | 'unknown';

export type AppError = Error & {
  code: AppErrorCode;
  cause?: unknown;
};

export function createAppError(code: AppErrorCode, cause?: unknown): AppError {
  const error = new Error(code) as AppError;
  error.name = 'AppError';
  error.code = code;
  error.cause = cause;
  return error;
}

export function isAppError(value: unknown): value is AppError {
  return (
    value instanceof Error &&
    value.name === 'AppError' &&
    'code' in value &&
    typeof (value as AppError).code === 'string'
  );
}
