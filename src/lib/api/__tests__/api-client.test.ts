import { z } from 'zod';

import { type AuthTokens } from '../../secure-storage';
import { createApiClient } from '../api-client';
import { ApiError } from '../api-error';

const itemSchema = z.object({ id: z.number() });

const initialTokens: AuthTokens = { accessToken: 'access-1', refreshToken: 'refresh-1' };
const rotatedTokens: AuthTokens = { accessToken: 'access-2', refreshToken: 'refresh-2' };

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

function createTokenStore(initial: AuthTokens | null) {
  let stored = initial;
  return {
    read: jest.fn(async () => stored),
    save: jest.fn(async (tokens: AuthTokens) => {
      stored = tokens;
    }),
    clear: jest.fn(async () => {
      stored = null;
    }),
    current: () => stored,
  };
}

type Handler = (url: string, init: RequestInit) => Promise<Response>;

function setup(handler: Handler, initial: AuthTokens | null = initialTokens) {
  const tokenStore = createTokenStore(initial);
  const fetchFn = jest.fn((input: RequestInfo | URL, init?: RequestInit) =>
    handler(String(input), init ?? {}),
  );
  const onSessionExpired = jest.fn();
  const client = createApiClient({
    baseUrl: 'https://api.test',
    tokenStore,
    tokenLifetimeMins: 30,
    fetchFn,
    timeoutMs: 1_000,
  });
  client.setSessionExpiredHandler(onSessionExpired);
  return { client, fetchFn, tokenStore, onSessionExpired };
}

function authHeader(init: RequestInit): string | undefined {
  return (init.headers as Record<string, string>).Authorization;
}

function rejectOnAbort(signal: AbortSignal | null | undefined, reject: (error: Error) => void) {
  if (signal?.aborted) return reject(new Error('aborted'));
  signal?.addEventListener('abort', () => reject(new Error('aborted')));
}

function isRefresh(url: string) {
  return url.endsWith('/auth/refresh');
}

describe('apiClient.request', () => {
  it('sends the access token and validates the response', async () => {
    const { client, fetchFn } = setup(async () => json({ id: 7 }));

    await expect(client.request('/auth/products/7', itemSchema)).resolves.toEqual({ id: 7 });

    const [url, init] = fetchFn.mock.calls[0]!;
    expect(url).toBe('https://api.test/auth/products/7');
    expect(authHeader(init!)).toBe('Bearer access-1');
  });

  it('serialises query params and skips undefined values', async () => {
    const { client, fetchFn } = setup(async () => json({ id: 1 }));

    await client.request('/auth/products', itemSchema, {
      query: { limit: 20, skip: 40, q: undefined },
    });

    expect(fetchFn.mock.calls[0]![0]).toBe('https://api.test/auth/products?limit=20&skip=40');
  });

  it('does not attach a token to public requests', async () => {
    const { client, fetchFn } = setup(async () => json({ id: 1 }), null);

    await client.request('/auth/login', itemSchema, { method: 'POST', body: {}, auth: false });

    expect(authHeader(fetchFn.mock.calls[0]![1]!)).toBeUndefined();
  });

  it('refreshes an expired token and retries the request once', async () => {
    const { client, tokenStore } = setup(async (url, init) => {
      if (isRefresh(url)) return json(rotatedTokens);
      return authHeader(init) === 'Bearer access-2' ? json({ id: 1 }) : json({}, 401);
    });

    await expect(client.request('/auth/products/1', itemSchema)).resolves.toEqual({ id: 1 });
    expect(tokenStore.current()).toEqual(rotatedTokens);
  });

  it('shares one refresh between concurrent requests', async () => {
    let releaseRefresh: () => void = () => undefined;
    const refreshGate = new Promise<void>((resolve) => {
      releaseRefresh = resolve;
    });

    const { client, fetchFn } = setup(async (url, init) => {
      if (isRefresh(url)) {
        await refreshGate;
        return json(rotatedTokens);
      }
      return authHeader(init) === 'Bearer access-2' ? json({ id: 1 }) : json({}, 401);
    });

    const requests = Promise.all([
      client.request('/auth/products/1', itemSchema),
      client.request('/auth/products/2', itemSchema),
      client.request('/auth/products/3', itemSchema),
    ]);
    await new Promise((resolve) => setTimeout(resolve, 0));
    releaseRefresh();

    await expect(requests).resolves.toHaveLength(3);
    const refreshCalls = fetchFn.mock.calls.filter(([url]) => isRefresh(String(url)));
    expect(refreshCalls).toHaveLength(1);
  });

  it('reuses tokens rotated by another request instead of refreshing again', async () => {
    const { client, fetchFn } = setup(async (url, init) => {
      if (isRefresh(url)) return json(rotatedTokens);
      return authHeader(init) === 'Bearer access-2' ? json({ id: 1 }) : json({}, 401);
    });

    await client.request('/auth/products/1', itemSchema);
    await client.request('/auth/products/2', itemSchema);

    const refreshCalls = fetchFn.mock.calls.filter(([url]) => isRefresh(String(url)));
    expect(refreshCalls).toHaveLength(1);
  });

  it('expires the session when the refresh token is rejected', async () => {
    const { client, tokenStore, onSessionExpired } = setup(async (url) =>
      isRefresh(url) ? json({ message: 'Invalid refresh token' }, 403) : json({}, 401),
    );

    await expect(client.request('/auth/products/1', itemSchema)).rejects.toMatchObject({
      kind: 'unauthorized',
    });
    expect(tokenStore.current()).toBeNull();
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it('expires the session when the retried request is still unauthorized', async () => {
    const { client, onSessionExpired } = setup(async (url) =>
      isRefresh(url) ? json(rotatedTokens) : json({}, 401),
    );

    await expect(client.request('/auth/products/1', itemSchema)).rejects.toMatchObject({
      kind: 'unauthorized',
    });
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it('keeps the session when the refresh fails because the device is offline', async () => {
    const { client, tokenStore, onSessionExpired } = setup(async (url) => {
      if (isRefresh(url)) throw new TypeError('Network request failed');
      return json({}, 401);
    });

    await expect(client.request('/auth/products/1', itemSchema)).rejects.toMatchObject({
      kind: 'network',
    });
    expect(tokenStore.current()).toEqual(initialTokens);
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it('rejects authenticated requests when there is no session', async () => {
    const { client, fetchFn, onSessionExpired } = setup(async () => json({ id: 1 }), null);

    await expect(client.request('/auth/products/1', itemSchema)).rejects.toBeInstanceOf(ApiError);
    expect(fetchFn).not.toHaveBeenCalled();
    expect(onSessionExpired).not.toHaveBeenCalled();
  });
});

describe('apiClient errors', () => {
  it('uses the server message for failed requests', async () => {
    const { client } = setup(async () => json({ message: 'Invalid credentials' }, 400));

    await expect(
      client.request('/auth/login', itemSchema, { method: 'POST', auth: false }),
    ).rejects.toMatchObject({ kind: 'http', status: 400, message: 'Invalid credentials' });
  });

  it('maps fetch failures to network errors', async () => {
    const { client } = setup(async () => {
      throw new TypeError('Network request failed');
    });

    await expect(client.request('/auth/products', itemSchema)).rejects.toMatchObject({
      kind: 'network',
    });
  });

  it('rejects responses that do not match the schema', async () => {
    const { client } = setup(async () => json({ id: 'seven' }));

    await expect(client.request('/auth/products/7', itemSchema)).rejects.toMatchObject({
      kind: 'invalid-response',
    });
  });

  it('reports cancellation separately from network failures', async () => {
    const controller = new AbortController();
    const { client } = setup(
      (_url, init) => new Promise((_resolve, reject) => rejectOnAbort(init.signal, reject)),
    );

    const pending = client.request('/auth/products', itemSchema, { signal: controller.signal });
    controller.abort();

    await expect(pending).rejects.toMatchObject({ kind: 'aborted' });
  });

  it('times out slow requests', async () => {
    jest.useFakeTimers();
    const { client } = setup(
      (_url, init) => new Promise((_resolve, reject) => rejectOnAbort(init.signal, reject)),
    );

    const pending = client.request('/auth/products', itemSchema);
    const assertion = expect(pending).rejects.toMatchObject({ kind: 'timeout' });
    await jest.advanceTimersByTimeAsync(1_000);
    await assertion;
    jest.useRealTimers();
  });
});
