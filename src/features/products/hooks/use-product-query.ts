import { useQuery } from '@tanstack/react-query';

import { loadProduct } from '../products-service';
import { productKeys } from './query-keys';

export function useProductQuery(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: ({ signal }) => loadProduct(id, signal),
    networkMode: 'always',
  });
}
