import { createAppError } from '@/domain';

import { mapFetchException, mapHttpResponseError } from './map-http-failure';

export type JsonFetchInit = RequestInit & {
  token?: string;
};

export type JsonFetchResult<T> = {
  data: T;
  headers: Headers;
};

/**
 * Thin native-fetch helper: optional Bearer auth, JSON parse, AppError mapping.
 * Not an injectable HTTP port — ApiClients call this for DRY only.
 */
export async function jsonFetch<T>(
  url: string,
  init: JsonFetchInit = {},
): Promise<JsonFetchResult<T>> {
  const { token, headers: initHeaders, ...rest } = init;
  const headers = new Headers(initHeaders);

  if (token !== undefined) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url, { ...rest, headers });
  } catch (error) {
    throw mapFetchException(error);
  }

  if (!response.ok) {
    throw await mapHttpResponseError(response);
  }

  let data: T;
  try {
    data = (await response.json()) as T;
  } catch (error) {
    throw createAppError('unknown', error);
  }

  return { data, headers: response.headers };
}
