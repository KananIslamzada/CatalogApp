# Testing

| Layer      | Tool                                          | Where                                             | Run                |
| ---------- | --------------------------------------------- | ------------------------------------------------- | ------------------ |
| Unit       | Jest (`jest-expo`)                            | `**/__tests__/*.test.ts` next to the code         | `npm test`         |
| Hook       | RNTL `renderHook` + real React Query          | `features/*/__tests__/use-*.test.tsx`             | `npm test`         |
| Component  | RNTL v14 (async `render`, `fireEvent`)        | `components/**/__tests__`, `features/*/__tests__` | `npm test`         |
| Screen     | RNTL, real route component, mocked data layer | `src/__tests__/screens/`                          | `npm test`         |
| End to end | Maestro                                       | `e2e/`                                            | `npm run test:e2e` |

`npm run check` = lint + typecheck + all Jest tests.

## Screen tests

`src/__tests__/screens/login.test.tsx` and `catalog.test.tsx` render the real route components (`@/app/login`, `@/app/(app)/index`) with only the service / repository layer mocked, so hooks, React Query, the list, debounce and navigation run for real. Catalog covers: first page and greeting, debounced search showing only name matches (one request), "No matches", tapping a card opens `/product/[id]` with `from: 'catalog'`.

They live outside `src/app` on purpose: expo-router turns every file under `app/` into a route, tests included (`/__tests__/login.test` showed up in the typed routes before they moved).

## Helpers and mocks

- `test-utils/query-client.tsx`: `createTestQueryClient` (`retry: false`, `gcTime: Infinity` so no timer keeps Jest alive), `createQueryWrapper`, `renderWithQueryClient`.
- `features/products/__fixtures__/`: `makeProduct`, `createClientWithFavourites` (favourites already in the cache, so cards don't update after the test ends and trigger act warnings).
- `jest.setup.ts`: Reanimated `setUpTests`, FlashList and Gesture Handler setups, stubs for Nitro (MMKV), keyboard-controller, safe-area, worklets' `getUIRuntimeHolder` (Gesture Handler 3) and `expo-network`'s listener.
- Skia has no Jest build: tests that render the list mock `product-list-skeleton`.

## Maestro

Install once: `curl -fsSL "https://get.maestro.mobile.dev" | bash`. Build and install the app (`npm run ios` / `npm run android`), keep Metro running, then `npm run test:e2e` (or `maestro test e2e/flows/03-search.yaml` for one flow). Flows use the demo account `emilys` / `emilyspass` against the live DummyJSON API.

| Flow                 | Covers                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------- |
| `01-login.yaml`      | Empty-field validation, wrong password error, sign in, session restored after a restart.              |
| `02-browse.yaml`     | Open product 1 (details), back, scroll until product 30 (second page loaded).                         |
| `03-search.yaml`     | "lipstick" shows Red Lipstick and hides other products, clear restores the catalog, no matches state. |
| `04-favourites.yaml` | Favourite from a card, favourites screen, still there after a restart, remove → empty state.          |
| `05-deep-link.yaml`  | Cold `catalog://product/42` while signed out → login → the product opens after sign in.               |
| `06-sign-out.yaml`   | Confirmation (cancel keeps the session), confirm → login, still signed out after a restart.           |

`subflows/fresh-login.yaml` (clear state + keychain, sign in) and `subflows/sign-in.yaml` (fill the form; `USERNAME` / `PASSWORD` env) are shared. Elements are found by `testID` (`login-submit`, `product-card-<id>`, `favourite-<id>`, `open-favourites`, `sign-out`, `confirm-sign-out`, `product-back`, `product-title`, `catalog-search`) or by visible text.

### Maestro gotchas (all hit while writing the flows)

- Never `hideKeyboard` on Android: Maestro types without opening the soft keyboard, so `hideKeyboard` sends Back and leaves the login screen (looks like a crash). Submit with `pressKey: Enter` instead; the password field submits on return.
- A subflow's own `env:` block wins over the `env` passed by `runFlow`, so `sign-in.yaml` has no defaults and every caller passes `USERNAME` / `PASSWORD`.
- `tapOn` retries when the screen did not change fast enough. Taps that navigate or toggle (`product-card-*`, `product-back`, `favourite-*`) set `retryTapIfNoChange: false`, otherwise the retry lands on the next screen or undoes the toggle.
- If a run fails right away with "Device server died", stop Maestro's driver (`adb shell am force-stop dev.mobile.maestro.test`) and run again.

Last full run (Android emulator): 6/6 flows passed in about 5 minutes.
