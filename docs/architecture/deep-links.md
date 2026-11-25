# Deep links

Scheme `catalog` (`app.json`). Supported link: `catalog://product/<id>`.

Every incoming URL is classified by `parseDeepLink`:

| Kind              | Examples                                            | Result                                                |
| ----------------- | --------------------------------------------------- | ----------------------------------------------------- |
| `passthrough`     | `catalog://`, `catalog://login`                     | normal routing                                        |
| `product`         | `catalog://product/42`, `/product/42/`, `?ref=…`    | parked, opened after sign-in (below)                  |
| `invalid-product` | `catalog://product/abc`, `/0`, `/-3`, `/42/reviews` | popup "Product link is broken", app stays where it is |
| `unknown`         | `catalog://settings`, `catalog://products/42`       | popup "Link not supported", app stays where it is     |

The popups use the shared `AppDialog` (works before the navigator or the dialog host is mounted, because requests sit in a store). `app/+not-found.tsx` is a safety net for any other unmatched route (e.g. a stale in-app link) with a "Go to catalog" action. Universal links (`https://…`) are not configured, so they are treated as unknown.

## How it works

| File                                                 | Role                                                                                                                                                           |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/+native-intent.tsx`                             | Re-exports `redirectSystemPath`. expo-router calls it for every incoming URL, including the one that cold-starts the app.                                      |
| `features/deep-links/parse-product-link.ts`          | Pure parser: accepts `catalog://product/42`, `/product/42`, trailing slash and query; rejects non-numeric, zero, negative, unsafe integers and extra segments. |
| `features/deep-links/pending-link-store.ts`          | In-memory Zustand store holding the product id waiting to be opened.                                                                                           |
| `features/deep-links/use-pending-link-navigation.ts` | Mounted in `app/(app)/_layout.tsx`, which only exists while signed in. Pushes `/product/[id]` and clears the pending id.                                       |

```
URL ─► redirectSystemPath
         │ not a product link ─► returned unchanged (normal routing)
         ▼ product link
     pendingProductId = id
     return '/' (cold start) or null (stay on the current screen)
         │
         ▼
(app)/_layout mounted? ── no (restoring / signed out) ─► waits; login screen shows
         │ yes                                              │ sign in succeeds
         ▼                                                  ▼
     router.push('/product/[id]')  ◄────────────── (app)/_layout mounts
```

Why not let the router open `/product/42` directly: when signed out, `Stack.Protected` redirects to login and the original URL is lost. Parking the id and opening it from a layout that only exists when signed in covers every case with one code path:

- signed in, app running → opens immediately on top of the current screen;
- cold start while signed in → opens once the session is restored;
- signed out (cold or warm) → login first, then the product, with home underneath so back works.

The pending id is only kept in memory: if the app is killed before the user signs in, the link is not resumed.

## Product route

`app/(app)/product/[id].tsx` re-validates the `id` param with the same parser and shows "Product not found" for anything invalid (the details screen itself comes later).

## Testing

- Unit: every parser kind, `redirectSystemPath` (cold vs warm, pass-through, broken and unknown links raise the popup), `usePendingLinkNavigation` (pending before sign in, arriving while signed in, opened only once).
- Manual (verified on an Android emulator: signed out warm and cold, signed in warm and cold, back navigation):

```bash
xcrun simctl openurl booted "catalog://product/42"
adb shell am start -W -a android.intent.action.VIEW -d "catalog://product/42" com.catalogapp.mobile
```

## Dev-only warnings on Android activity recreation

Changing the system font or display size recreates the Android activity (that is what makes React Native re-measure text). For a moment the old root is still mounted while the new one starts, so React Navigation logs "configured linking in multiple places" / "multiple navigation containers consuming the shared imperative routing queue". The app has a single container (expo-router's) and deep links keep working right after recreation (verified on an emulator), so both messages are filtered in `LogBox` in `app/_layout.tsx`. Keeping the activity alive with `configChanges="fontScale"` was tried and rejected: text then stays at the old size until restart.
