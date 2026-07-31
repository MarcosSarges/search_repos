export type AppErrorCode =
  | 'rate_limit'
  | 'network'
  | 'not_found'
  | 'empty_query'
  | 'unknown';

export type AppError = Error & {
  code: AppErrorCode;
  cause?: unknown;
};

export function createAppError(
  code: AppErrorCode,
  message: string,
  cause?: unknown,
): AppError {
  const error = new Error(message) as AppError;
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
