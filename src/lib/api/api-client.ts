import { z } from 'zod';

import { type AuthTokens } from '../secure-storage';
import { ApiError } from './api-error';
import { withTimeout } from './with-timeout';

type TokenStore = {
  read(): Promise<AuthTokens | null>;
  save(tokens: AuthTokens): Promise<void>;
  clear(): Promise<void>;
};

export type QueryParams = Record<string, string | number | undefined>;

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  query?: QueryParams;
  body?: unknown;
  signal?: AbortSignal;
  auth?: boolean;
};

type ApiClientConfig = {
  baseUrl: string;
  tokenStore: TokenStore;
  tokenLifetimeMins: number;
  fetchFn?: typeof fetch;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 15_000;

const tokensSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

const errorBodySchema = z.object({ message: z.string() });

export function createApiClient({
  baseUrl,
  tokenStore,
  tokenLifetimeMins,
  fetchFn = fetch,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: ApiClientConfig) {
  let tokens: AuthTokens | null | undefined;
  let refreshInFlight: Promise<AuthTokens> | null = null;
  let onSessionExpired: (() => void) | null = null;

  async function getTokens(): Promise<AuthTokens | null> {
    if (tokens === undefined) {
      tokens = await tokenStore.read();
    }
    return tokens;
  }

  async function setTokens(next: AuthTokens): Promise<void> {
    tokens = next;
    await tokenStore.save(next);
  }

  async function clearTokens(): Promise<void> {
    tokens = null;
    await tokenStore.clear();
  }

  async function expireSession(): Promise<ApiError> {
    const hadSession = tokens !== null;
    await clearTokens();
    if (hadSession) onSessionExpired?.();
    return new ApiError('unauthorized', 'Session expired', 401);
  }

  function buildUrl(path: string, query?: QueryParams): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined) params.append(key, String(value));
    }
    const search = params.toString();
    return `${baseUrl}${path}${search ? `?${search}` : ''}`;
  }

  async function send(path: string, options: RequestOptions, accessToken?: string) {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const timeout = withTimeout(options.signal, timeoutMs);
    try {
      return await fetchFn(buildUrl(path, options.query), {
        method: options.method ?? 'GET',
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: timeout.signal,
      });
    } catch {
      if (options.signal?.aborted) throw new ApiError('aborted', 'Request was cancelled');
      if (timeout.didTimeOut()) throw new ApiError('timeout', 'Request timed out');
      throw new ApiError('network', 'Network request failed');
    } finally {
      timeout.cleanup();
    }
  }

  async function parse<T>(response: Response, schema: z.ZodType<T>): Promise<T> {
    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const body = errorBodySchema.safeParse(payload);
      const message = body.success ? body.data.message : `Request failed (${response.status})`;
      const kind = response.status === 401 ? 'unauthorized' : 'http';
      throw new ApiError(kind, message, response.status);
    }

    const result = schema.safeParse(payload);
    if (!result.success) {
      throw new ApiError('invalid-response', 'Unexpected response from server', response.status);
    }
    return result.data;
  }

  async function runRefresh(): Promise<AuthTokens> {
    const current = await getTokens();
    if (!current) throw await expireSession();

    const response = await send('/auth/refresh', {
      method: 'POST',
      body: { refreshToken: current.refreshToken, expiresInMins: tokenLifetimeMins },
    });

    if (response.status === 401 || response.status === 403) throw await expireSession();

    const next = await parse(response, tokensSchema);
    await setTokens(next);
    return next;
  }

  function refreshTokens(): Promise<AuthTokens> {
    refreshInFlight ??= runRefresh().finally(() => {
      refreshInFlight = null;
    });
    return refreshInFlight;
  }

  async function request<T>(
    path: string,
    schema: z.ZodType<T>,
    options: RequestOptions = {},
  ): Promise<T> {
    if (options.auth === false) {
      return parse(await send(path, options), schema);
    }

    const used = await getTokens();
    if (!used) throw await expireSession();

    let response = await send(path, options, used.accessToken);

    if (response.status === 401) {
      const rotated = tokens && tokens.accessToken !== used.accessToken ? tokens : null;
      const fresh = rotated ?? (await refreshTokens());
      response = await send(path, options, fresh.accessToken);
      if (response.status === 401) throw await expireSession();
    }

    return parse(response, schema);
  }

  return {
    request,
    getTokens,
    setTokens,
    clearTokens,
    setSessionExpiredHandler(handler: (() => void) | null) {
      onSessionExpired = handler;
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
