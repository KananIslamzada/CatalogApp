# Favourites

Requirement: favourites with optimistic updates, stored locally, available offline, removed on logout.

Favourites live in the products feature (they are products), so there are no import cycles between features.

## Data

| File                            | Role                                                                                                                                                                                                                                     |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data/favourites-repository.ts` | `readFavourites()` joins `favourites` with `products`, newest first. `addFavourite(product)` upserts the product row first, so a favourite always has the data to show offline. `removeFavourite(id)`.                                   |
| `hooks/use-favourites.ts`       | `useFavourites()` (the list), `useIsFavourite(id)` (a `select` on the same query, so a card only re-renders when its own heart changes), `useToggleFavourite()`, `useFavouriteToggle(product)` (state + toggle with a selection haptic). |
| `hooks/query-keys.ts`           | `favouriteKeys.all`.                                                                                                                                                                                                                     |

The query is local only: `networkMode: 'always'`, `staleTime: Infinity`. It never goes stale by itself; only our own writes change it.

## Optimistic toggle

`useToggleFavourite`:

1. `onMutate` cancels any running favourites read, snapshots the list and adds or removes the product right away. The heart changes on the same frame as the tap.
2. `onError` puts the snapshot back. The global `MutationCache` shows a toast; the mutation's `meta.errorKey` picks the message ("Couldn't update favourites") instead of the generic network one.
3. `onSettled` re-reads SQLite, but only when it is the last favourites write still running (`isMutating === 1`), so a fast second tap is never overwritten by the first one's refetch.
4. All favourite writes share `scope: { id: 'favourites' }`, so React Query runs them one after another. Tapping add-remove-add quickly writes to SQLite in the same order as the taps.

## UI

- `components/favourite-button.tsx`: glass heart button (`IconButton`), filled red when saved, a short ease-out pop when it becomes a favourite. Label switches between "Add to favourites" and "Remove from favourites", `accessibilityState.selected` reflects the state.
- Product card: heart in the top-right corner of the image. The card is one accessible element, so the heart is also offered as a custom accessibility action (`toggleFavourite`) on the card for VoiceOver / TalkBack.
- Details: heart on the right of the floating top bar (`product-favourite-button.tsx`).
- Catalog top bar: heart button that opens `app/(app)/favourites.tsx` → `components/favourites-screen.tsx`, a grid of the same cards (so the shared image transition works from there too) with an empty state.

## Logout

`clearDatabase()` already deletes the `favourites` table and `queryClient.clear()` drops the cached list, so nothing from the previous user is left in memory or on disk.

## Tests

`use-favourites.test.tsx` (shows a favourite before the write finishes, rolls back when a removal fails), `favourites-ui.test.tsx` (heart on a card, favourites list, empty state). Component tests that render cards use `renderWithQueryClient` from `test-utils/query-client.tsx` and mock the repository.
