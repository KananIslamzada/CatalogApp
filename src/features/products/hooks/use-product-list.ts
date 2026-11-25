import { useCallback, useState } from 'react';

import { useOpenProduct } from './use-open-product';
import { useProductSearchQuery } from './use-product-search-query';
import { useProductsQuery } from './use-products-query';

export function useProductList(term: string) {
  const catalog = useProductsQuery();
  const search = useProductSearchQuery(term);
  const [isRefreshing, setRefreshing] = useState(false);
  const isSearching = term.length > 0;

  const { refresh, fetchNextPage, hasNextPage, isFetchingNextPage, isFetchNextPageError } = catalog;
  const refetchSearch = search.refetch;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      if (isSearching) await refetchSearch();
      else await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [isSearching, refetchSearch, refresh]);

  const onEndReached = useCallback(() => {
    if (isSearching) return;
    if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError) fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchNextPageError, isFetchingNextPage, isSearching]);

  const retryNextPage = useCallback(() => {
    fetchNextPage();
  }, [fetchNextPage]);

  const openProduct = useOpenProduct();

  const shared = { isRefreshing, onRefresh, onEndReached, retryNextPage, openProduct };

  if (!isSearching) {
    return {
      ...shared,
      isSearching,
      products: catalog.products,
      status: catalog.status,
      error: catalog.error,
      refetch: catalog.refetch,
      hasNextPage,
      isFetchingNextPage,
      isFetchNextPageError,
      isStale: false,
      isBusy: false,
    };
  }

  const hasResults = search.data !== undefined;
  const showsCatalogMeanwhile = !hasResults && search.status !== 'error';

  return {
    ...shared,
    isSearching,
    products: hasResults ? search.data.products : showsCatalogMeanwhile ? catalog.products : [],
    status: searchStatus(hasResults, search.status, catalog.products.length > 0),
    error: search.error,
    refetch: refetchSearch,
    hasNextPage: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    isStale: search.isPlaceholderData || showsCatalogMeanwhile,
    isBusy: search.isFetching,
  };
}

function searchStatus(
  hasResults: boolean,
  status: 'pending' | 'error' | 'success',
  hasCatalog: boolean,
): 'pending' | 'error' | 'success' {
  if (hasResults) return 'success';
  if (status === 'error') return 'error';
  return hasCatalog ? 'success' : status;
}
