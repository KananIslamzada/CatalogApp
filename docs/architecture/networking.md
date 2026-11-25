# Networking

All HTTP goes through `apiClient` from `@/lib/api`. Features call it from their `api/` modules; nothing else calls `fetch`.

## API

DummyJSON (`EXPO_PUBLIC_API_URL`, default `https://dummyjson.com`). Products are read from `/auth/products`, the authenticated variant, so the access token and refresh flow are exercised on every request.

| Endpoint              | Notes                                                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `POST /auth/login`    | `{ username, password, expiresInMins }` → user + `accessToken` + `refreshToken`. Wrong credentials: `400 { message }`. |
| `POST /auth/refresh`  | `{ refreshToken, expiresInMins }` → new token pair. Invalid refresh token: `403`.                                      |
| `GET /auth/products…` | Expired or missing access token: `401`.                                                                                |

`EXPO_PUBLIC_TOKEN_LIFETIME_MINS` (default 30) is sent as `expiresInMins`. Set it to `1` to see refresh happen quickly while testing. See `.env.example`.

## `request(path, schema, options)`

- The response body is validated with a zod schema, so callers get typed data and a malformed response becomes an error instead of a crash later.
- `options`: `method`, `query` (undefined values are dropped), `body` (JSON), `signal`, `auth` (default `true`).
- Every request has a 15 s timeout combined with the caller's `AbortSignal`.

## Token refresh

```
request ─► send with access token ─► 401?
                                      │ no ─► parse
                                      ▼ yes
                     tokens already rotated by another request?
                          │ yes ─► retry with them
                          ▼ no
                     refreshTokens()  (single in-flight promise, shared)
                          │
              ┌───────────┼─────────────────────┐
        new tokens    401 / 403          network / timeout
              │            │                     │
     save + retry once   expire session      throw, keep session
              │
       still 401? ─► expire session
```

- **Single flight:** concurrent 401s wait on the same refresh promise, so the refresh endpoint is called once.
- **No loops:** a request is retried at most once.
- **Offline is not logout:** only an explicit 401/403 from the refresh endpoint ends the session. A network failure during refresh keeps the tokens, so the user stays signed in and the app can show cached data.
- **Expiring the session** clears the tokens from memory and secure storage and calls the handler set with `setSessionExpiredHandler` (wired to the auth store in the auth part). The handler fires only when there actually was a session, so parallel failures don't trigger it several times.
- Tokens are cached in memory after the first secure-storage read, so the Keychain is not hit on every request.

## Errors

`ApiError` has a `kind`: `network`, `timeout`, `aborted`, `unauthorized`, `http` (server `message` kept, `status` set) or `invalid-response`. The UI maps kinds to translated messages; server text is only shown where it is meant for the user (e.g. "Invalid credentials").

## Testing

`createApiClient` takes `fetchFn` and `tokenStore`, so `__tests__/api-client.test.ts` runs every path with a fake fetch: refresh and retry, one shared refresh for concurrent requests, rejected refresh, offline refresh, schema mismatch, cancellation and timeout.

## Network status and the offline indicator

| File                                        | Role                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `lib/network.ts`                            | `isOffline(state)`: offline only when `expo-network` says `isConnected === false` or `isInternetReachable === false`. Unknown values (Android reports them for a moment at startup) count as online, so the banner never flashes on launch. `useIsOffline()` wraps `useNetworkState()`.                                                                                                                                                                                        |
| `lib/network.ts` → `connectOnlineManager()` | Feeds `expo-network` events into React Query's `onlineManager` (called once in `query-client.ts`). When the connection comes back, active queries refetch on their own (`refetchOnReconnect`), so the catalog swaps saved data for fresh data without a pull.                                                                                                                                                                                                                  |
| `components/offline-banner.tsx`             | Floating glass pill above the bottom safe area: "You're offline · Showing saved products". Mounted once in the root layout, so it shows on every screen, login included. Slides up and fades in (`FadeInDown`, 220 ms ease-out) and out the same way. `pointerEvents="none"`: it never blocks the list under it and never moves layout. Screen readers get an announcement on every change ("You're offline" / "Back online") and the pill is a polite live region on Android. |

Every query and mutation uses `networkMode: 'always'`, so the `onlineManager` never pauses them: offline, the query functions fall back to SQLite themselves (see products-data.md). Login does not go through React Query.

Tests: `lib/__tests__/network.test.ts` (offline rules), `components/__tests__/offline-banner.test.tsx` (hidden online, shown offline, announcements).
