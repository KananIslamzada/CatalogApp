# Auth

## Pieces

| File                                           | Role                                                                                                                                  |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `features/auth/api/auth-api.ts`                | `login(credentials)` → `{ user, tokens }` via `POST /auth/login` (`auth: false`).                                                     |
| `features/auth/session-store.ts`               | Zustand store: `status` (`restoring` / `signedOut` / `signedIn`), `user`, `expired`, and `restore` / `signIn` / `signOut` / `expire`. |
| `features/auth/clear-user-data.ts`             | Wipes everything the user left on the device.                                                                                         |
| `features/auth/hooks/use-session-bootstrap.ts` | Calls `restore()` once on launch and hides the splash screen when it settles.                                                         |
| `features/auth/hooks/use-login-form.ts`        | react-hook-form + zod schema (messages translated), maps errors to user-facing text.                                                  |
| `features/auth/hooks/use-sign-out.ts`          | Sign-out with a pending state for the button.                                                                                         |
| `app/_layout.tsx`                              | `Stack.Protected` guards: `(app)` only when signed in, `login` only when signed out.                                                  |

## Flows

**Launch.** The splash stays up while `restore()` reads the tokens (Keychain) and the cached profile (MMKV, zod-validated). Both present → `signedIn` with no network call, so a restart works offline. Tokens without a profile are dropped. Any storage error → `signedOut`.

**Sign in.** Validate → `login()` → if a _different_ user's profile is still cached (left over from an expired session), wipe local data first → save tokens → cache profile → `signedIn`. The guard swaps the login screen for the app.

**Token expiry.** Handled by the API client (see `networking.md`). When the refresh token is rejected the client clears the tokens and calls `expire()`: status becomes `signedOut` with `expired: true`, the in-memory query cache is cleared and the login screen shows "Your session expired". Local favourites and cached products are kept so the same user gets them back after signing in again.

**Sign out.** `clearUserData()`: cancel and clear React Query, then (in parallel, failures don't block each other) clear tokens, empty SQLite, clear the expo-image memory and disk caches, then wipe MMKV. Only after that does the status flip, so a fast re-login can't race the wipe.

## Error messages

| Error                | Shown                                 |
| -------------------- | ------------------------------------- |
| 400 / 401 from login | "Wrong username or password"          |
| `network`            | "No internet connection"              |
| `timeout`            | "The server took too long to respond" |
| 5xx                  | "Something went wrong on our side"    |
| anything else        | "Something went wrong"                |

## Trade-offs

- The cached profile in MMKV is public data (name, email, avatar URL); tokens never leave secure storage.
- Expiry keeps local data instead of wiping it, because a refresh failure is not the user choosing to leave. A different account signing in triggers the wipe.

## Tests

- `features/auth/__tests__/session-store.test.ts`: restore, sign in, user switch, failed sign in, sign out, expiry.
- `app/__tests__/login.test.tsx` (component test of the screen): validation, trimmed username, wrong credentials, offline, expired notice.
