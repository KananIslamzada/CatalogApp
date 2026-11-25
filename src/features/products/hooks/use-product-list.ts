import { router } from 'expo-router';
import { useCallback, useState } from 'react';

import { useProductsQuery } from './use-products-query';

export function useProductList() {
  const query = useProductsQuery();
  const [isRefreshing, setRefreshing] = useState(false);
  const { refresh, fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError } = query;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError) fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchNextPageError, isFetchingNextPage]);

  const retryNextPage = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  const openProduct = useCallback((id: number) => {
    router.push({ pathname: '/product/[id]', params: { id: String(id) } });
  }, []);

  return { ...query, isRefreshing, onRefresh, onEndReached, retryNextPage, openProduct };
}
