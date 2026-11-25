# Products data

Layering: `api/` (DummyJSON) → `data/` (SQLite) → `products-service.ts` (network first, cache fallback) → React Query hooks → UI.

## Files

| File                                            | Role                                                                                                                                                                 |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `features/products/types.ts`                    | zod `productSchema` / `productPageSchema` (API boundary), `ProductPage` and `ProductResult` with a `source: 'network' \| 'cache'`.                                   |
| `features/products/api/products-api.ts`         | `fetchProducts({ skip, limit, signal })`, `fetchProduct(id, signal)` on `/auth/products` with `select=` so only the fields we show are downloaded.                   |
| `features/products/data/product-row.ts`         | Row type and mappers. `brand` is optional in the API (92 of 194 products have none) and stored as `NULL`; `images` is a JSON column parsed defensively.              |
| `features/products/data/products-repository.ts` | `saveProducts` (upsert with one prepared statement inside a transaction), `readProductsPage(skip, limit)` (`ORDER BY id`, same order as the API), `readProduct(id)`. |
| `features/products/products-service.ts`         | `loadProductsPage`, `loadProduct`: the fallback rules below.                                                                                                         |
| `features/products/hooks/use-products-query.ts` | `useInfiniteQuery` (page size 20), flat `products`, `isFromCache`, `refresh`.                                                                                        |
| `features/products/hooks/use-product-query.ts`  | Single product query.                                                                                                                                                |
| `features/products/hooks/query-keys.ts`         | `productKeys.all / list() / detail(id)`.                                                                                                                             |

## Fallback rules

Every successful network response is written to SQLite (a failed write is logged and ignored: fresh data still reaches the UI).

| Network result                                        | What the UI gets                                         |
| ----------------------------------------------------- | -------------------------------------------------------- |
| Success                                               | Network data, `source: 'network'`                        |
| `network`, `timeout`, `5xx`                           | Cached rows for the same page, `source: 'cache'`         |
| …and nothing cached for the first page / that product | The original error (UI shows the error state with retry) |
| …and nothing cached for a later page                  | An empty page: the list simply ends                      |
| `unauthorized`, `aborted`, `4xx`                      | The error, never hidden behind stale data                |

The queries use `networkMode: 'always'`, because the query function handles offline itself; React Query's default `online` mode would pause it and never reach the cache.

## Pagination

`nextSkip(lastPage)` continues while `skip + products.length < total` and the page is not empty. Offline, `total` is the number of cached rows, so pagination stops exactly where the cache ends.

`refresh()` (pull-to-refresh) trims the infinite query to its first page before refetching, so it costs one request instead of one per loaded page.

## Verified on device

Android emulator: 3 pages online (60 products) → network off → refresh served page 1 from SQLite, next pages served pages 2 and 3, the list ended at 60 with no error.

## Tests

`__tests__/product-row.test.ts`, `products-service.test.ts` (every row of the fallback table), `use-products-query.test.tsx` (paging, cache flag, one-request refresh). Fixtures live in `__fixtures__/` so Jest does not run them as suites.

## List screen

`app/(app)/index.tsx` = `ProductList` (with `CatalogHeader` as its list header) + a floating `CatalogTopBar`.

### Collapsing header with pinned search

iOS large-title pattern, driven on the UI thread (`useCollapsingHeader`: `useAnimatedScrollHandler` on `Animated.createAnimatedComponent(FlashList)`, which works because FlashList's ref exposes `getScrollableNode`). Only opacity and transforms animate, never layout, so FlashList is not re-laid-out while scrolling.

- `CatalogHeader` (list header): large "Catalog" title and greeting, plus empty space the height of the search row. It scrolls with the content; the title fades as it goes under the bar and stretches slightly on overscroll. Its height is measured once (`onTitleLayout`) because it depends on the user's font size.
- `CatalogTopBar` (full-screen absolute overlay, `pointerEvents="box-none"`; it must cover the screen so the translated search row stays inside its parent's bounds, otherwise Android clips its visible rect to nothing and TalkBack / Maestro treat the field as invisible; the bar and the search row still catch their own touches): compact bar with the inline title (fades in once the large title has scrolled past) and sign-out, and the `SearchField` row. The search row is translated by `max(0, titleHeight - scrollY)`: it sits under the large title at rest, rises with the content, then stays **pinned** under the bar.
- Backdrop (`ScrollEdgeBackdrop`) fades in as the header collapses. It is solid over the bar and the whole pinned search row, then fades out over 24 pt below it (`solidUntil`): on iOS a light blur (`BlurView`, intensity 20, 40% background tint) masked by that gradient, on Android a background-coloured gradient (97% → 92% → transparent). It replaces a hard divider (Apple's scroll-edge effect).
- When the debounced search term changes, `useScrollToResults` scrolls to `min(scrollY, titleHeight)`: the header stays collapsed (more room for results with the keyboard open) and the first result row sits right under the pinned search; near the top nothing moves.
- The list pads its content by `safe-area top + TOP_BAR_HEIGHT`; the refresh spinner and scroll indicator use the same offset. Loading / error / empty states render in the list's empty slot, so header and search stay visible in every state.

`@react-native-masked-view/masked-view` 0.3.2 ships typings that don't compile against React Native 0.88's strict types (its class extends `NativeMethods`), so `scroll-edge-backdrop.tsx` gives it a precise local prop type.

| File                                   | Role                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `components/catalog-header.tsx`        | Large "Catalog" title, greeting, glass sign-out button. Sign-out asks for confirmation (`useConfirmSignOut`) because it deletes favourites and cached products.                                                                                                                                                                                                                 |
| `components/product-list.tsx`          | FlashList v2, two columns. States: `pending` → skeleton, error with no data → `StateView` with retry, empty → `StateView`, otherwise the grid. Pull-to-refresh via `RefreshControl`.                                                                                                                                                                                            |
| `components/product-card.tsx`          | Memoised card: `expo-image` thumbnail (`recyclingKey` so recycled cells never flash the previous image, `cachePolicy="memory-disk"`, 150 ms transition), discount badge, brand or category, price (`Intl.NumberFormat`, cached per locale), rating. One accessibility label for the whole card. Title reserves two lines (scaled with the font size) so cards in a row line up. |
| `components/product-list-skeleton.tsx` | Skia canvas drawing the grid placeholders with one shared animated `LinearGradient` shimmer; static when Reduce Motion is on.                                                                                                                                                                                                                                                   |
| `components/product-list-footer.tsx`   | Loading-more spinner, "Couldn't load more" + retry, or "That's everything".                                                                                                                                                                                                                                                                                                     |
| `hooks/use-product-list.ts`            | Wraps `useProductsQuery`: `onEndReached` (skips when there's no next page, one is loading, or the last one failed: retry is manual so a failing page doesn't loop), `isRefreshing` (only the user's pull shows the spinner, not background refetches), `openProduct`.                                                                                                           |

`maintainVisibleContentPosition` is disabled (FlashList v2 enables it by default). Search and clearing replace the whole dataset; with anchoring on, switching from the empty "No matches" state back to the catalog left the grid blank until the user scrolled.

Performance: stable `renderItem` / `keyExtractor`, memoised cards with a stable `onPress(id)`, no inline objects per cell, images cached and recycled, skeleton is a single canvas instead of dozens of animated views.

Verified on an Android emulator: skeleton, grid, scrolling through all 194 products to the end footer, pull-to-refresh, dark mode, sign-out confirmation.

## Search

Requirement: debounced search **by product name**, and a slow response for an old query must never replace the results of a newer one.

| File                                   | Role                                                                                                                                                                                                                                                                                                                                  |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hooks/use-catalog-search.ts`          | Owns the typed text; `term` is the trimmed text debounced by 300 ms (`hooks/use-debounced-value.ts`). Clearing the field returns to the catalog immediately, without waiting for the debounce.                                                                                                                                        |
| `hooks/use-product-search-query.ts`    | `useQuery` keyed by `productKeys.search(term)`, `enabled` only for a non-empty term, `placeholderData: keepPreviousData`, `networkMode: 'always'`.                                                                                                                                                                                    |
| `products-service.ts` → `searchByName` | `GET /auth/products/search?q=…&limit=0`, then keeps only products whose **title** contains the term (case-insensitive). DummyJSON also matches descriptions ("phone" → 23 results, 8 by name). Results are saved to SQLite. Offline / 5xx: `searchCachedProducts` (`instr(lower(title), lower(?))`, so `%` and `_` need no escaping). |
| `hooks/use-product-list.ts`            | Switches the list between catalog and search mode. While the first results for a term load, the current list stays visible but dimmed (`isStale`); search errors show a search-specific error state, never an empty result. No pagination in search mode.                                                                             |

Why old responses can't win:

1. Each term has its own cache entry, and the screen only reads the entry for the current `term`. A late `pho` response lands in the `pho` entry, which nothing is rendering.
2. When the term changes, the previous query loses its observer and React Query aborts its `AbortSignal` (the API client passes it to `fetch`), so the request is actually cancelled.
3. The debounce keeps the number of requests down while typing.

All matches come back in one request (`limit=0`): the whole catalogue is 194 products, so a search result is small. If the catalogue grew, search would move to the same infinite query as the list.

Tests: `use-product-search-query.test.tsx` resolves the old term's request after the new one and asserts the new results stay and the old signal is aborted; plus debounce timing, name filtering, offline search and the list's search states.

## Product details

`app/(app)/product/[id].tsx` parses the id and renders `ProductDetailsScreen` (also the target of `catalog://product/<id>`).

| File                                    | Role                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `find-cached-product.ts`                | Looks the product up in the list and search caches. `useProductQuery` uses it as `placeholderData`, so a product opened from the grid renders on the first frame while the detail request refreshes it.                                                                                                                                                                                                                                       |
| `components/product-details-screen.tsx` | Route body: invalid id → `ProductNotFound`, otherwise `ProductDetails`. `product-details.tsx` renders the loaded page (state in `hooks/use-product-details.ts`: query, image pages, gallery index, viewer); `product-load-state.tsx` covers the rest: nothing yet (cold deep link) → `ProductDetailsSkeleton`, then the content fades in; 404 → "Product not found"; other errors → message + retry. The back button is shown in every state. |
| `components/product-gallery.tsx`        | Square, horizontally paged `Animated.ScrollView` of the images; the first page shows the cached thumbnail as `placeholder` until the full image arrives. Each page has an accessibility label ("image 2 of 4").                                                                                                                                                                                                                               |
| `components/gallery-dots.tsx`           | Page dots driven by the horizontal scroll offset on the UI thread (opacity + scale, no layout).                                                                                                                                                                                                                                                                                                                                               |
| `components/product-info.tsx`           | Brand · category, title, price with the pre-discount price struck through and the discount pill, rating, stock (`stockLevel`: in / only N left / out), description.                                                                                                                                                                                                                                                                           |
| `components/product-top-bar.tsx`        | Floating glass back button. Once the gallery scrolls under it, the scroll-edge backdrop and the inline title fade in (`useProductDetailScroll`). Overscroll stretches the gallery (iOS).                                                                                                                                                                                                                                                      |
| `components/shared-image.ts`            | `AnimatedImage` (expo-image as an animated component), `productImageTag(id)` and the transition. The card thumbnail and the gallery's first image carry the tag themselves, so the thumbnail flies into the gallery and back. The discount badge is not part of it.                                                                                                                                                                           |

Shared element transitions are on by default in Reanimated 4.8 (`ENABLE_SHARED_ELEMENT_TRANSITIONS`), but a view only moves between screens that are wrapped in a `SharedTransitionBoundary` whose `isActive` follows focus. `app/(app)/_layout.tsx` does this for every screen of the stack with `screenLayout` + `components/screen-boundary.tsx` (`useIsFocused`). Without the boundaries the views just show in place. Transitions are skipped when Reduce Motion is on, and only run when the target view exists on the first frame, which is why the placeholder data matters.

Why the transition is a custom progress animation (320 ms ease-out): the default one animates the moving view's `width`/`height`, but the image inside an expo-image view (and any child of a moving view) is only laid out again when the transition ends, so the picture stayed card-sized and jumped at the end. `scaleImage` keeps the moving view at its starting size and animates its centre plus a scale matrix, so the picture itself grows and shrinks. Both images are square, so the scale is uniform. On iOS the same function follows the back swipe. The shared views use explicit sizes (`100%` in the card, `size` in the gallery), never `absoluteFill` insets.

The overscroll stretch transforms only the image pager, not the page dots.

Tags are scoped to the screen the product was opened from: `productImageTag(source, id)` gives `catalog-product-image-42` or `favourites-product-image-42`, and `useOpenProduct(source)` passes `from` in the route params, which the details route parses with `parseProductSource`. So the image only flies between a card and the details page it opened, never between the catalog and favourites grids (which show the same products). A product opened from a deep link has no source and no tag.

Tests: `product-details-screen.test.tsx` (content, instant render from the list cache, skeleton, 404, retry), `find-cached-product.test.ts`, `format.test.ts`.

Jest: `standard-navigation` (pulled in by expo-router) is ESM-only, so it is in `transformIgnorePatterns`.

### Full-screen image viewer

Tapping a gallery image opens `components/image-viewer.tsx`, an overlay inside the details screen (not a modal route: shared transitions cannot move into a React Native `Modal` on Android, and an overlay keeps one transition we control).

- `hooks/use-image-viewer-motion.ts`: one `progress` value (0 → 1, 280 ms ease-out) moves the content from the gallery's on-screen position (`galleryTop`, taken from the details scroll offset when it opens) to the centre while a black backdrop fades in. A vertical pan (Gesture Handler 3 `usePanGesture`, `activeOffsetY` ±12, `failOffsetX` ±12 so horizontal paging still wins) drags the image, scales it down slightly and fades the backdrop; releasing past 120 pt or 800 pt/s closes it, otherwise it eases back. Android back closes it too.
- Paging is a horizontal `FlatList` starting at the tapped image, with a "2 / 4" counter and a close button.
- The gallery follows the viewer's page (`index` / `onIndexChange` in `ProductDetails`), so closing always flies back to the image that is showing.
- While the gallery is not on its first image, the first image drops its `sharedTransitionTag`, so navigating back to the list does not fly the wrong image into the card.

Jest: Gesture Handler 3 asks worklets for the UI runtime, which the Jest build does not provide, so `jest.setup.ts` stubs `getUIRuntimeHolder`. Screens with gestures are rendered inside `GestureHandlerRootView` in tests.
