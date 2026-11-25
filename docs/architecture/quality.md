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

- Default reporter logs to the console. To use Sentry, Crashlytics or Bugsnag, call `setErrorReporter(...)` once at startup with an adapter; no other file changes.
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

`.github/workflows/ci.yml`, on pushes to `main` / `development` and on pull requests, Node from `.nvmrc` (24 LTS), npm cache:

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
- Reduce Motion: Reanimated timing animations and layout animations follow the system setting, the shared image transition is skipped, the Skia shimmer is static.
- Live updates: the offline pill announces "You're offline" / "Back online"; toasts use the alert role.
- Overlays: the image viewer is modal for VoiceOver (`accessibilityViewIsModal`) and hides the details screen from TalkBack (`importantForAccessibility="no-hide-descendants"`) while open.
- The catalog's floating header covers the full screen with `box-none`, so the search field has real bounds for TalkBack (see products-data.md).
