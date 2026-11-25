import { type QueryClient } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { createQueryWrapper, createTestQueryClient } from '@/test-utils/query-client';

import { nextSkip, useProductsQuery } from '../hooks/use-products-query';
import { loadProductsPage } from '../products-service';
import { type ProductPage } from '../types';
import { makeProduct } from '../__fixtures__/products';

jest.mock('../products-service', () => ({ loadProductsPage: jest.fn() }));

const mockedLoad = jest.mocked(loadProductsPage);

function page(skip: number, count: number, total: number, source: 'network' | 'cache' = 'network') {
  const products = Array.from({ length: count }, (_, index) => makeProduct(skip + index + 1));
  return { products, total, skip, source } satisfies ProductPage;
}

describe('nextSkip', () => {
  it('continues while there are more products', () => {
    expect(nextSkip(page(0, 20, 194))).toBe(20);
  });

  it('stops at the last page or an empty page', () => {
    expect(nextSkip(page(180, 14, 194))).toBeUndefined();
    expect(nextSkip(page(40, 0, 194))).toBeUndefined();
  });
});

describe('useProductsQuery', () => {
  let client: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = createTestQueryClient();
    mockedLoad.mockImplementation(async ({ skip }) => page(skip, 20, 60));
  });

  afterEach(() => {
    client.clear();
  });

  it('loads pages one after another into a flat list', async () => {
    const { result } = await renderHook(() => useProductsQuery(), {
      wrapper: createQueryWrapper(client),
    });
    await waitFor(() => expect(result.current.products).toHaveLength(20));

    await act(() => result.current.fetchNextPage());

    await waitFor(() => expect(result.current.products).toHaveLength(40));
    expect(mockedLoad).toHaveBeenLastCalledWith(expect.objectContaining({ skip: 20, limit: 20 }));
    expect(result.current.hasNextPage).toBe(true);
  });

  it('reports when any visible page came from the offline cache', async () => {
    mockedLoad.mockResolvedValue(page(0, 5, 5, 'cache'));

    const { result } = await renderHook(() => useProductsQuery(), {
      wrapper: createQueryWrapper(client),
    });

    await waitFor(() => expect(result.current.isFromCache).toBe(true));
  });

  it('refreshes only the first page on pull-to-refresh', async () => {
    const { result } = await renderHook(() => useProductsQuery(), {
      wrapper: createQueryWrapper(client),
    });
    await waitFor(() => expect(result.current.products).toHaveLength(20));
    await act(() => result.current.fetchNextPage());
    await waitFor(() => expect(result.current.products).toHaveLength(40));
    mockedLoad.mockClear();

    await act(() => result.current.refresh());

    await waitFor(() => expect(result.current.products).toHaveLength(20));
    expect(mockedLoad).toHaveBeenCalledTimes(1);
    expect(mockedLoad).toHaveBeenCalledWith(expect.objectContaining({ skip: 0 }));
  });
});
