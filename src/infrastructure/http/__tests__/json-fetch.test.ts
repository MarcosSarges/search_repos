import { http, HttpResponse } from 'msw';

import { isAppError } from '@/domain';
import { server } from '@/test/msw/server';
import { useMswServer } from '@/test/msw/use-msw-server';

import { jsonFetch } from '../json-fetch';

describe('jsonFetch', () => {
  useMswServer(server);

  it('returns parsed JSON data and response headers without auth when token omitted', async () => {
    let sawAuthorization = false;
    let sawPrivateToken = false;

    server.use(
      http.get('https://api.example.test/items', ({ request }) => {
        sawAuthorization = request.headers.has('Authorization');
        sawPrivateToken = request.headers.has('PRIVATE-TOKEN');
        return HttpResponse.json({ id: 1 }, { headers: { 'X-Custom': 'yes' } });
      }),
    );

    const result = await jsonFetch<{ id: number }>('https://api.example.test/items');

    expect(result.data).toEqual({ id: 1 });
    expect(result.headers.get('X-Custom')).toBe('yes');
    expect(sawAuthorization).toBe(false);
    expect(sawPrivateToken).toBe(false);
  });

  it('sends Authorization Bearer when tokenHeader is bearer', async () => {
    let authorization: string | null = null;

    server.use(
      http.get('https://api.example.test/secure', ({ request }) => {
        authorization = request.headers.get('Authorization');
        return HttpResponse.json({ ok: true });
      }),
    );

    await jsonFetch('https://api.example.test/secure', {
      token: 'gh-secret',
      tokenHeader: 'bearer',
    });

    expect(authorization).toBe('Bearer gh-secret');
  });

  it('sends PRIVATE-TOKEN when tokenHeader is private-token', async () => {
    let privateToken: string | null = null;

    server.use(
      http.get('https://api.example.test/gl', ({ request }) => {
        privateToken = request.headers.get('PRIVATE-TOKEN');
        return HttpResponse.json({ ok: true });
      }),
    );

    await jsonFetch('https://api.example.test/gl', {
      token: 'gl-secret',
      tokenHeader: 'private-token',
    });

    expect(privateToken).toBe('gl-secret');
  });

  it('rejects non-OK responses with mapped AppError including 429 structured cause', async () => {
    server.use(
      http.get('https://api.example.test/rate', () => {
        return new HttpResponse(null, {
          status: 429,
          headers: {
            'X-RateLimit-Reset': '1700000000',
            'Retry-After': '45',
          },
        });
      }),
      http.get('https://api.example.test/denied', () => {
        return new HttpResponse(null, { status: 401 });
      }),
      http.get('https://api.example.test/missing', () => {
        return new HttpResponse(null, { status: 404 });
      }),
    );

    try {
      await jsonFetch('https://api.example.test/rate');
      throw new Error('expected rejection');
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      if (isAppError(error)) {
        expect(error.code).toBe('rate_limit');
        expect(error.cause).toEqual({
          status: 429,
          resetAtEpochSeconds: 1700000000,
          retryAfterSeconds: 45,
        });
      }
    }

    try {
      await jsonFetch('https://api.example.test/denied');
      throw new Error('expected rejection');
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      if (isAppError(error)) {
        expect(error.code).toBe('unauthorized');
      }
    }

    try {
      await jsonFetch('https://api.example.test/missing');
      throw new Error('expected rejection');
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      if (isAppError(error)) {
        expect(error.code).toBe('not_found');
      }
    }
  });

  it('rejects AbortError with aborted AppError', async () => {
    server.use(
      http.get('https://api.example.test/slow', async () => {
        await new Promise(() => {});
        return HttpResponse.json({});
      }),
    );

    const controller = new AbortController();
    const pending = jsonFetch('https://api.example.test/slow', {
      signal: controller.signal,
    });
    controller.abort();

    try {
      await pending;
      throw new Error('expected rejection');
    } catch (error) {
      expect(isAppError(error)).toBe(true);
      if (isAppError(error)) {
        expect(error.code).toBe('aborted');
      }
    }
  });
});
