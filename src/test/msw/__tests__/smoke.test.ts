import { http, HttpResponse } from 'msw';

import { server } from '../server';
import { useMswServer } from '../use-msw-server';

describe('MSW Jest harness', () => {
  useMswServer(server);

  it('intercepts fetch with a handler and returns the fixture', async () => {
    server.use(
      http.get('https://example.test/smoke', () => {
        return HttpResponse.json({ ok: true });
      }),
    );

    const response = await fetch('https://example.test/smoke');
    const body = (await response.json()) as { ok: boolean };

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true });
  });
});
