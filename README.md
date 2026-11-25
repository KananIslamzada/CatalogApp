# Catalog

A React Native app (Expo, iOS and Android) for a signed-in user to browse the [DummyJSON](https://dummyjson.com/docs) product catalogue, search it, open product details (also through deep links) and keep a list of favourites that works offline.

- Expo SDK 58, React Native 0.88 (New Architecture only), React 19, TypeScript strict
- Light and dark mode, English and Azerbaijani
- 182 Jest tests (unit, hook, component, screen) and 6 Maestro end-to-end flows

## Contents

- [Quick start](#quick-start)
- [Tests and quality checks](#tests-and-quality-checks)
- [Architecture](#architecture)
- [Libraries and why](#libraries-and-why)
- [How each requirement is met](#how-each-requirement-is-met)
- [Assumptions](#assumptions)
- [Trade-offs](#trade-offs)
- [Known issues](#known-issues)
- [What I would do next](#what-i-would-do-next)
- [Time spent](#time-spent)
- [Use of AI tools](#use-of-ai-tools)

## Quick start

### Requirements

- Node 24 (`.nvmrc`)
- Xcode 26+ for iOS, Android Studio with an emulator for Android
- [Maestro](https://maestro.mobile.dev) for the end-to-end flows (optional)

The app uses native modules (MMKV, SQLite, secure storage, Reanimated), so it runs as a development build, not in Expo Go.

### Run

```bash
npm install
npm run ios       # builds and runs on the iOS simulator
npm run android   # builds and runs on the Android emulator
```

Demo account (DummyJSON test user): **emilys / emilyspass**. In development builds the login screen shows it as a hint.

### Configuration

Copy `.env.example` to `.env` to override:

| Variable                          | Default                 | Use                                                                             |
| --------------------------------- | ----------------------- | ------------------------------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL`             | `https://dummyjson.com` | API base URL                                                                    |
| `EXPO_PUBLIC_TOKEN_LIFETIME_MINS` | `30`                    | Access token lifetime requested at login. Set `1` to see the automatic refresh. |

No secrets are needed; both values are public.

### Release build (Android)

```bash
npm run android:release
# APK: android/app/build/outputs/apk/release/app-release.apk (~69 MB)
```

Release builds use R8 code shrinking, resource shrinking and only the `arm64-v8a` and `x86_64` ABIs (configured with `expo-build-properties` in `app.json`; the `android/` and `ios/` folders are generated and not committed).

### Deep links

```bash
xcrun simctl openurl booted "catalog://product/42"
adb shell am start -W -a android.intent.action.VIEW -d "catalog://product/42" com.catalogapp.mobile
```

When signed out, the app shows the login screen first and opens the product right after sign-in. Broken links (`catalog://product/abc`) and unknown links show a popup instead of a blank screen.

## Tests and quality checks

```bash
npm run check          # lint + typecheck + all Jest tests
npm run lint
npm run typecheck
npm test
npm run format:check   # Prettier
npm run test:e2e       # Maestro, needs the app installed and running on a device or emulator
```

| Layer      | What is covered                                                                                                                                                                                                                                    |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit       | API client (token refresh, single-flight refresh, offline is not logout, timeouts, schema validation), deep link parsing, cache fallback rules, search name filter, formatting, migrations, SQLite write queue, offline detection, error reporting |
| Hooks      | Paginated products query (paging, one-request refresh, cache flag), search race (an old, slower response never replaces the new one, and its request is aborted), favourites (optimistic add, rollback on failure), list state                     |
| Components | Button, text field, catalog top bar with search, product card, list states, product details (states, list-cache placeholder, image viewer), favourites screen, dialog, toast, offline banner, error boundary                                       |
| Screens    | `login` and `catalog` routes rendered for real with only the data layer mocked (`src/__tests__/screens`)                                                                                                                                           |
| End to end | Maestro (`e2e/`): login validation + session restore, browse + pagination + details, search, favourites surviving a restart, deep link while signed out, sign out                                                                                  |

All six Maestro flows pass on the Android emulator against both the debug and the R8-shrunk release build. CI (`.github/workflows/ci.yml`) runs format, lint, typecheck, Jest and `expo-doctor` on every push.

## Architecture

```
UI (routes in src/app, components)        renders state, no data access
   │
Hooks (features/*/hooks)                  React Query + small zustand stores, screen logic
   │
Services (features/*/…-service.ts)        domain rules: network first, cache fallback, name filter
   │
Data access                               api/ (DummyJSON, zod-validated)   data/ (SQLite repositories)
   │
lib/                                      HTTP client + token refresh, secure storage, MMKV, SQLite, network status, error reporting
```

### Folder structure

```
src/
  app/                  expo-router routes only (thin: they compose feature components)
    (app)/              signed-in stack: catalog, favourites, product/[id]
    login.tsx           signed-out stack
    +native-intent.tsx  deep link entry
  features/
    auth/               session store, login form, sign-in/out, expiry handling
    products/           API, SQLite repositories, service, query hooks, list, search, details, favourites
    deep-links/         link parsing, pending link kept through login
  components/
    ui/                 design-system primitives (Button, IconButton, TextField, SearchField, GlassSurface, StateView, dialog, toast…)
  lib/                  api client, database, secure/kv storage, network, query client, error reporting
  theme/                palettes, tokens, typography, motion
  i18n/                 typed translations (en, az)
  hooks/                shared hooks (debounce, stable busy state)
  test-utils/           query client helpers for tests
e2e/                    Maestro flows and subflows
docs/architecture/      design notes per area (start with overview.md)
```

Each feature exposes a small public `index.ts`; routes import from there. Favourites live inside `products` because they are products, which keeps features free of import cycles.

### Key flows

- **Session.** Tokens are in the Keychain/Keystore; the public user profile is in MMKV so the first screen renders without waiting. On launch the session is restored before the splash hides. `Stack.Protected` guards the signed-in and signed-out stacks.
- **Token refresh.** The API client refreshes once on a 401 and retries the request. Concurrent 401s share one refresh. If the refresh is rejected the session expires and the user is sent to login with a message. If the refresh fails because the device is offline, the session is kept.
- **Products and offline.** Every product response is written to SQLite. When the network fails (offline, timeout, 5xx) the same page is served from SQLite, so everything seen before stays browsable. A floating "You're offline" pill is shown while offline, and queries refetch automatically when the connection returns.
- **Search.** 300 ms debounce, one React Query entry per term and request cancellation, so a late response for an old term can never replace newer results. Only name matches are shown (DummyJSON also matches descriptions).
- **Favourites.** Stored in SQLite with the product row, so the list works offline. Toggling is optimistic with rollback, and writes are serialised so fast double taps end in the right state.
- **Deep links.** `+native-intent` parses the link. Signed out, the product id is parked and opened after sign-in.
- **Logout** wipes tokens, SQLite, MMKV, the image caches and the query cache. A different user signing in on the same device also wipes the previous user's data first.

More detail per area is in [`docs/architecture`](docs/architecture/overview.md).

## Libraries and why

| Area                 | Library                                                                                   | Why                                                                                                                    |
| -------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Framework            | Expo SDK 58 (development builds, CNG)                                                     | Native modules without maintaining `ios/` and `android/` by hand; config plugins keep native settings in `app.json`.   |
| Navigation           | expo-router                                                                               | File-based routes, typed routes, `Stack.Protected` for auth guards, built-in deep link handling with `+native-intent`. |
| Server state         | @tanstack/react-query                                                                     | Caching, infinite queries, cancellation (search race), optimistic mutations, refetch on reconnect.                     |
| Client state         | zustand                                                                                   | Tiny stores for session, pending deep link and dialogs, usable outside React (API client callbacks).                   |
| Tokens               | expo-secure-store                                                                         | Keychain / Keystore, `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`, never backed up.                                           |
| Key-value            | react-native-mmkv                                                                         | Synchronous reads, so the saved profile is available on the first render.                                              |
| Offline data         | expo-sqlite                                                                               | Queryable cache (pages, search by name, joins for favourites), migrations via `user_version`.                          |
| Validation           | zod                                                                                       | Validates every API response and stored JSON; types come from the schemas.                                             |
| Forms                | react-hook-form + @hookform/resolvers                                                     | Validation on blur with zod, no re-render per keystroke.                                                               |
| List                 | @shopify/flash-list v2                                                                    | Cell recycling for a smooth 2-column grid on mid-range Android.                                                        |
| Images               | expo-image                                                                                | Memory + disk cache, recycling keys for list cells, placeholders.                                                      |
| Animation / gestures | react-native-reanimated 4, react-native-gesture-handler 3                                 | UI-thread animations: collapsing header, shared image transition, skeleton shimmer, image viewer gestures.             |
| Native look          | expo-glass-effect, expo-blur, expo-linear-gradient, @react-native-masked-view/masked-view | Liquid Glass buttons on iOS 26 with solid fallbacks; scroll-edge blur and gradients.                                   |
| Keyboard             | react-native-keyboard-controller                                                          | Keeps the focused input above the keyboard on both platforms.                                                          |
| Network status       | expo-network                                                                              | Offline indicator and React Query's `onlineManager`.                                                                   |
| Feedback             | react-native-toast-message, expo-haptics                                                  | Global error toasts, light haptics on key actions.                                                                     |
| Icons                | lucide-react-native                                                                       | Consistent stroke icons, tree-shakable.                                                                                |
| Tests                | jest-expo, @testing-library/react-native, Maestro                                         | Behaviour-focused component tests; Maestro flows are plain YAML and work on both platforms.                            |

## How each requirement is met

| Requirement                                                       | Where                                                                                                                  |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Login with validation and errors                                  | `features/auth/components/login-form.tsx`, `hooks/use-login-form.ts`                                                   |
| Session survives restart                                          | `features/auth/session-store.ts` (`restore`)                                                                           |
| Automatic refresh, back to login if it fails                      | `lib/api/api-client.ts`, tests in `lib/api/__tests__/api-client.test.ts`                                               |
| Infinite scroll, pull-to-refresh, loading/empty/error + retry     | `features/products/components/product-list.tsx`, `hooks/use-products-query.ts`                                         |
| Debounced, race-safe search by name                               | `hooks/use-catalog-search.ts`, `hooks/use-product-search-query.ts`, `products-service.ts`                              |
| Details: gallery, price, rating, description                      | `components/product-details.tsx`, `product-gallery.tsx`, `product-info.tsx`                                            |
| Deep link, also when logged out                                   | `src/app/+native-intent.tsx`, `features/deep-links/`                                                                   |
| Optimistic favourites, stored on device, offline                  | `hooks/use-favourites.ts`, `data/favourites-repository.ts`                                                             |
| Offline viewing and indicator                                     | `products-service.ts` (cache fallback), `src/components/offline-banner.tsx`                                            |
| Logout clears everything                                          | `features/auth/clear-user-data.ts`                                                                                     |
| Tokens in Keychain / Keystore                                     | `lib/secure-storage.ts`                                                                                                |
| Accessibility                                                     | Labels and roles on every control, font scaling up to 2×, Reduce Motion respected (see `docs/architecture/quality.md`) |
| Extras: dark mode, Reanimated, CI, two languages, error reporting | `theme/`, animations above, `.github/workflows/ci.yml`, `i18n/`, `lib/error-reporting.ts`                              |

## Assumptions

- DummyJSON is used as is. Its access tokens are short-lived JWTs, `/auth/refresh` rotates both tokens, and product endpoints are called through `/auth/products` so they need a valid session.
- DummyJSON has no favourites API, so favourites are device-only (the brief asks for them to be stored on the device).
- "Search by name" means the product title. DummyJSON's search also matches descriptions, so results are filtered to title matches.
- A session that expires (refresh rejected) keeps the cached catalogue and favourites, because it is the same user on the same device. Logout, or a different user signing in, wipes them.
- "Offline" means the device reports no connection or no internet. A server error while online falls back to the cache too, but does not show the offline pill.

## Trade-offs

- **Expo dev builds over bare React Native.** Faster setup and native config in `app.json`; the price is regenerating native projects (`prebuild`) when native config changes.
- **SQLite for the offline cache, not a persisted React Query cache.** More code (repository, migrations), but offline pages, offline search and favourites joined with products are real queries instead of one big JSON blob.
- **Search loads all matches in one request (`limit=0`).** The whole catalogue is 194 products, so this is simpler than paginating search. With a large catalogue, search would use the same infinite query as the list.
- **Network first, cache second.** Fresh data whenever possible; offline, the cache answers immediately after the request fails (bounded by the request timeout).
- **Shared image transition only between a card and the product it opens.** Tags are scoped per screen, so moving between catalog and favourites never flies the wrong image.
- **No pinch-to-zoom in the image viewer.** Paging and drag-to-dismiss only, to keep the scope small.
- **Skia was dropped.** It was used only for the skeleton shimmer and cost about 27 MB of APK size; a Reanimated + gradient shimmer looks the same.

## Known issues

- **iOS keyboard:** focusing the password field can scroll twice before settling. It comes from the keyboard library's own adjustment and was left as is rather than adding layout workarounds.
- **Android font-scale change:** changing the system font size recreates the activity, and React Navigation logs a "linking configured in multiple places" warning in development. It is harmless and filtered in LogBox.
- **Performance** was checked on an Android emulator (debug and release builds), not yet profiled on a physical mid-range device.
- Maestro runs locally; it is not part of CI.

## What I would do next

- Profile the list on a physical mid-range Android device in a release build (FlashList, image sizes, JS thread).
- Run Maestro in CI (EAS build + an Android emulator job or Maestro Cloud).
- Pinch-to-zoom for the image viewer.
- Plug a real crash reporter into the existing `ErrorReporter` interface (Sentry or Crashlytics).
- Persist favourites to a backend when one exists and sync them across devices.
- Sort and category filters on the catalogue.

## Time spent

8 hours.

## Use of AI tools

I used an AI coding assistant (Claude) during development, mainly to get UI components ready quickly: the design-system primitives (buttons, glass surfaces, text fields, search field, dialog, toast), animation and layout polish, and boilerplate for tests and documentation. It also helped while debugging a few platform-specific issues (shared transitions, Maestro on Android). Architecture, data flow and feature decisions were mine, and every change was reviewed, run and tested before it was committed.
