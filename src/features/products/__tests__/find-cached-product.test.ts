import { type InfiniteData } from '@tanstack/react-query';

import { createTestQueryClient } from '@/test-utils/query-client';

import { findCachedProduct } from '../find-cached-product';
import { productKeys } from '../hooks/query-keys';
import { type ProductPage, type SearchResult } from '../types';
import { makeProduct } from '../__fixtures__/products';

describe('findCachedProduct', () => {
  it('finds a product already loaded by the catalog list', () => {
    const client = createTestQueryClient();
    client.setQueryData<InfiniteData<ProductPage>>(productKeys.list(), {
      pages: [
        { products: [makeProduct(1)], total: 2, skip: 0, source: 'network' },
        { products: [makeProduct(2)], total: 2, skip: 1, source: 'cache' },
      ],
      pageParams: [0, 1],
    });

    expect(findCachedProduct(client, 2)).toEqual({ product: makeProduct(2), source: 'cache' });
  });

  it('finds a product from search results', () => {
    const client = createTestQueryClient();
    client.setQueryData<SearchResult>(productKeys.search('lip'), {
      term: 'lip',
      products: [makeProduct(7)],
      source: 'network',
    });

    expect(findCachedProduct(client, 7)?.product.id).toBe(7);
  });

  it('returns nothing for a product that was never loaded', () => {
    expect(findCachedProduct(createTestQueryClient(), 42)).toBeUndefined();
  });
});
