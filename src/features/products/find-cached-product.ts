import { type InfiniteData, type QueryClient } from '@tanstack/react-query';

import { productKeys } from './hooks/query-keys';
import { type ProductPage, type ProductResult, type SearchResult } from './types';

export function findCachedProduct(queryClient: QueryClient, id: number): ProductResult | undefined {
  const lists = queryClient.getQueriesData<InfiniteData<ProductPage>>({
    queryKey: productKeys.list(),
  });
  for (const [, data] of lists) {
    for (const page of data?.pages ?? []) {
      const product = page.products.find((item) => item.id === id);
      if (product) return { product, source: page.source };
    }
  }

  const searches = queryClient.getQueriesData<SearchResult>({ queryKey: productKeys.searches() });
  for (const [, data] of searches) {
    const product = data?.products.find((item) => item.id === id);
    if (product) return { product, source: data?.source ?? 'cache' };
  }

  return undefined;
}
