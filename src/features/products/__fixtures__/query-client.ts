import { createTestQueryClient } from '@/test-utils/query-client';

import { favouriteKeys } from '../hooks/query-keys';
import { type Product } from '../types';

export function createClientWithFavourites(favourites: Product[] = []) {
  const client = createTestQueryClient();
  client.setQueryData(favouriteKeys.all, favourites);
  return client;
}
