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
