# Deep links

Scheme `catalog` (`app.json`). Supported link: `catalog://product/<id>`.

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

- Unit: parser cases, `redirectSystemPath` (cold vs warm, pass-through), `usePendingLinkNavigation` (pending before sign in, arriving while signed in, opened only once).
- Manual (verified on an Android emulator: signed out warm and cold, signed in warm and cold, back navigation):

```bash
xcrun simctl openurl booted "catalog://product/42"
adb shell am start -W -a android.intent.action.VIEW -d "catalog://product/42" com.catalogapp.mobile
```
