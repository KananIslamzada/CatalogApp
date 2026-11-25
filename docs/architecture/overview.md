# Overview

Catalog: a signed-in user browses the DummyJSON product catalogue, searches it, opens product details (also through `catalog://product/<id>`) and keeps favourites that work offline.

## Stack

| Concern        | Choice                                                                                        | Why                                                                                                                                                               |
| -------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime        | Expo SDK 58, React Native 0.88, React 19.3, New Architecture, Hermes                          | CNG keeps `ios/` and `android/` out of the repo; config plugins cover every native setting we need.                                                               |
| Navigation     | `expo-router`                                                                                 | File-based routes, deep links for free (`scheme: catalog`), typed routes, `Stack.Protected` for auth guards.                                                      |
| Server state   | `@tanstack/react-query`                                                                       | Infinite queries, pull-to-refresh, cancellation through `AbortSignal`, query keys per search term (old responses can't overwrite new ones), optimistic mutations. |
| Client state   | `zustand`                                                                                     | Session status only. Small, no provider, easy to reset on logout.                                                                                                 |
| Offline data   | `expo-sqlite`                                                                                 | Products and favourites are relational, queryable and can be large. Survives restarts, works fully offline.                                                       |
| Key-value      | `react-native-mmkv`                                                                           | Synchronous, fast storage for non-sensitive prefs (e.g. locale override).                                                                                         |
| Secrets        | `expo-secure-store`                                                                           | Access/refresh tokens live in Keychain / Keystore only.                                                                                                           |
| Network status | `expo-network`                                                                                | Feeds React Query's `onlineManager` and the offline banner.                                                                                                       |
| Forms          | `react-hook-form` + `zod`                                                                     | Uncontrolled inputs (no re-render per keystroke), schema gives typed values and messages.                                                                         |
| Lists          | `@shopify/flash-list` v2                                                                      | Cell recycling, smooth on mid-range Android in release builds.                                                                                                    |
| Images         | `expo-image`                                                                                  | Memory + disk cache, downscaling, placeholders and transitions.                                                                                                   |
| Animation      | `react-native-reanimated` 4.8 + `react-native-worklets`                                       | UI-thread animations; shared element transition list → details (stable since 4.8).                                                                                |
| Graphics       | `@shopify/react-native-skia`                                                                  | Only where plain views can't do it well (e.g. shimmer skeletons).                                                                                                 |
| Tests          | `jest-expo`, `@testing-library/react-native`, Maestro                                         | Unit + hook + component tests in Jest, one end-to-end flow in Maestro.                                                                                            |
| Quality        | ESLint (`eslint-config-expo` flat) + Prettier, TypeScript strict + `noUncheckedIndexedAccess` | `npm run check` runs all three gates.                                                                                                                             |

Reanimated/Worklets are pinned above the SDK default (4.7) to get stable shared element transitions, so they are listed in `expo.install.exclude`.

## Folder layout (`src/`)

| Path                 | What                                                                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/`               | expo-router routes only. Screens are thin: they compose feature components and hooks.                                                               |
| `features/<domain>/` | `auth`, `products`, `favourites`, `network`. Each holds `api/` (network calls), `data/` (SQLite repositories), `hooks/`, `components/`, `types.ts`. |
| `components/ui/`     | Design-system primitives shared by every feature (text, button, input, screen, icon).                                                               |
| `lib/`               | Infrastructure singletons: HTTP client, secure storage, MMKV instance, SQLite database, query client.                                               |
| `theme/`             | Light/dark palettes, spacing, typography.                                                                                                           |
| `types/`             | Shared cross-feature types.                                                                                                                         |

Alias: `@/*` → `src/*`.

## Data flow

`api/` (fetch, typed DTOs) → `data/` (SQLite cache) → React Query hook in `hooks/` → component.
Screens never call `fetch` or SQLite directly.

## Conventions

- Function components and hooks only. One component per file; logic lives in a `use-*.ts` hook next to it.
- No code comments; intent goes into names, types and these docs.
- No `any`. Domain types are explicit; API responses are typed at the boundary.
- Every interactive element has `accessibilityRole` and `accessibilityLabel`; text respects system font scaling.
- Nothing sensitive is logged. Tokens never leave `lib/secure-storage`.

## Scripts

`npm run start` · `ios` · `android` · `android:release` · `lint` · `typecheck` · `test` · `test:e2e` · `check`
