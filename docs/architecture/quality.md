# Error reporting, CI and accessibility

## Error reporting

`lib/error-reporting.ts` is the only place the app talks to a crash/error service.

```ts
type ErrorReporter = {
  captureException(error: unknown, context?: ErrorContext): void;
  captureMessage(message: string, context?: ErrorContext): void;
  setUser(user: { id: number } | null): void;
};
```

- Default reporter logs to the console in development only; release builds stay silent until a real service is plugged in, so nothing ends up in device logs. To use Sentry, Crashlytics or Bugsnag, call `setErrorReporter(...)` once at startup with an adapter; no other file changes.
- Everything else imports `errorReporter`, which forwards to whichever reporter is plugged in.

What gets reported:

| Source                                                                                                      | Context                                                                 |
| ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Uncaught JS errors (`installGlobalErrorHandler`, root layout)                                               | `{ fatal, source: 'global' }` (then the default handler runs as before) |
| Render crashes: root `ErrorBoundary` (`components/app-error-boundary.tsx`, exported from `app/_layout.tsx`) | `{ source: 'error-boundary' }`                                          |
| Query / mutation errors (`lib/query-client.ts`)                                                             | `queryKey` / `mutationKey`                                              |
| Failed SQLite cache writes (`products-service.ts`)                                                          | `{ area: 'products-cache' }`                                            |
| Session restore failure, logout wipe failures                                                               | `{ area: ... }`                                                         |
| Signed-in user (`session-store.ts` subscription)                                                            | user **id only**, no name or email                                      |

`isExpectedError` keeps noise out: offline, timeouts, cancelled requests and expired sessions (`network`, `timeout`, `aborted`, `unauthorized`) are normal app states with their own UI, so they are not reported. HTTP 5xx, invalid responses (zod) and anything that is not an `ApiError` are.

The error boundary shows "Something went wrong" with Try again (`retry` re-renders the route), uses only theme colours (it renders outside the root providers, so no safe-area hooks), and hides the splash screen in case the crash happened during startup.

## CI

`.github/workflows/ci.yml`, on every push (any branch) and on pull requests, Node from `.nvmrc` (24 LTS), npm cache:

1. `npm ci`
2. `npm run format:check` (Prettier)
3. `npm run lint`
4. `npm run typecheck` (verified to pass on a clean checkout without the generated `expo-env.d.ts` / `.expo/types`)
5. `npm test -- --ci`
6. `npx expo-doctor`

Maestro is not in CI: it needs a built app on an emulator (an EAS build + Maestro Cloud or an Android emulator runner job). Run it locally with `npm run test:e2e`.

## Accessibility

- Every pressable has a role and a label (cards: one label with title, price and rating; icon buttons: required `accessibilityLabel` prop; gallery images: "image 2 of 4").
- The heart on a card is also a custom accessibility action on the card, because the card is a single accessible element.
- Selected state on the heart (`accessibilityState.selected`); disabled state is merged in `IconButton`.
- Headings: screen titles, product title, "About this product", dialog titles and state views use `accessibilityRole="header"`.
- Touch targets ≥ 44 pt (icon buttons 44 pt + 8 pt hit slop; the card heart is 34 pt + 8 pt slop = 50 pt).
- Dynamic Type / font scale up to 2× (`MAX_FONT_SCALE`), icons scale with `useScaledSize` (capped at 1.5×), nothing clips at 2× on Android.
- Reduce Motion: Reanimated timing animations and layout animations follow the system setting, the shared image transition is skipped, the skeleton shimmer is static.
- Live updates: the offline pill announces "You're offline" / "Back online"; toasts use the alert role.
- Overlays: the image viewer is modal for VoiceOver (`accessibilityViewIsModal`) and hides the details screen from TalkBack (`importantForAccessibility="no-hide-descendants"`) while open.
- The catalog's floating header covers the full screen with `box-none`, so the search field has real bounds for TalkBack (see products-data.md).

## Secrets in the bundle

The login screen's demo-account hint is rendered only under `__DEV__`, and the credentials are passed as parameters there (the translation is `Demo account: {username} / {password}`), so the release bundle does not contain the password (checked with `npx expo export --platform android` and a search of the Hermes bundle).

## Release build (Android)

`expo-build-properties` in `app.json` (applied by `npx expo prebuild`; `android/` is generated, never edited by hand):

| Option                                 | Value                 | Why                                                                                                                                                          |
| -------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `enableMinifyInReleaseBuilds`          | `true`                | R8 removes unused Java/Kotlin code (`classes.dex` ≈ 6 MB).                                                                                                   |
| `enableShrinkResourcesInReleaseBuilds` | `true`                | Removes unused Android resources; needs R8.                                                                                                                  |
| `buildArchs`                           | `arm64-v8a`, `x86_64` | Drops the 32-bit ABIs. arm64 covers modern phones and Apple Silicon emulators, x86_64 covers Intel emulators. Expo has no per-ABI APK split, only this list. |

R8 safety: Reanimated, Worklets, Screens, expo-image and react-native-svg ship consumer ProGuard rules, `expo-modules-core` keeps every Expo module, React Native keeps `@DoNotStrip` classes, and MMKV's Nitro bindings are annotated `@Keep` / `@DoNotStrip`. Verified by building with `npx expo run:android --variant release` and running the full Maestro suite against the release app: 6/6 flows passed, no `ClassNotFoundException` / `NoSuchMethodError` in logcat.

Size: native libraries are stored uncompressed (`useLegacyPackaging: false`, the modern default: Android maps them directly and the Play Store compresses downloads). The first release APK was ~97 MB; Skia (13.6 MB per ABI, only used for the loading skeleton) was then replaced by a Reanimated + gradient shimmer: the APK is now 68.8 MB, and the full Maestro suite still passes on the release build.
