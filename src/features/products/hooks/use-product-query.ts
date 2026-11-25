import { useQuery, useQueryClient } from '@tanstack/react-query';

import { findCachedProduct } from '../find-cached-product';
import { loadProduct } from '../products-service';
import { type ProductResult } from '../types';
import { productKeys } from './query-keys';

export function useProductQuery(id: number) {
  const queryClient = useQueryClient();

  return useQuery<ProductResult>({
    queryKey: productKeys.detail(id),
    queryFn: ({ signal }) => loadProduct(id, signal),
    placeholderData: () => findCachedProduct(queryClient, id),
    networkMode: 'always',
  });
}
