import { useInfiniteQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { loadProductsPage } from '../products-service';
import { type ProductPage } from '../types';
import { productKeys } from './query-keys';

export const PAGE_SIZE = 20;

export function nextSkip(lastPage: ProductPage): number | undefined {
  const next = lastPage.skip + lastPage.products.length;
  return lastPage.products.length > 0 && next < lastPage.total ? next : undefined;
}

export function useProductsQuery() {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: productKeys.list(),
    queryFn: ({ pageParam, signal }) =>
      loadProductsPage({ skip: pageParam, limit: PAGE_SIZE, signal }),
    initialPageParam: 0,
    getNextPageParam: nextSkip,
    networkMode: 'always',
  });

  const products = useMemo(
    () => query.data?.pages.flatMap((page) => page.products) ?? [],
    [query.data],
  );

  const isFromCache = query.data?.pages.some((page) => page.source === 'cache') ?? false;

  const { refetch } = query;
  const refresh = useCallback(async () => {
    queryClient.setQueryData<InfiniteData<ProductPage, number>>(productKeys.list(), (data) =>
      data ? { pages: data.pages.slice(0, 1), pageParams: data.pageParams.slice(0, 1) } : data,
    );
    await refetch();
  }, [queryClient, refetch]);

  return { ...query, products, isFromCache, refresh };
}
