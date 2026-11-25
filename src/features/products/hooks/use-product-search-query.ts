import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { searchByName } from '../products-service';
import { productKeys } from './query-keys';

export function useProductSearchQuery(term: string) {
  return useQuery({
    queryKey: productKeys.search(term),
    queryFn: ({ signal }) => searchByName(term, signal),
    enabled: term.length > 0,
    placeholderData: keepPreviousData,
    networkMode: 'always',
  });
}
