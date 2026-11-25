import { act, renderHook } from '@testing-library/react-native';
import { router } from 'expo-router';

import { useProductList } from '../hooks/use-product-list';
import { useProductSearchQuery } from '../hooks/use-product-search-query';
import { useProductsQuery } from '../hooks/use-products-query';
import { makeProduct } from '../__fixtures__/products';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('../hooks/use-products-query', () => ({ useProductsQuery: jest.fn() }));
jest.mock('../hooks/use-product-search-query', () => ({ useProductSearchQuery: jest.fn() }));

const mockedQuery = jest.mocked(useProductsQuery);
const mockedSearchQuery = jest.mocked(useProductSearchQuery);

function mockSearch(overrides: Record<string, unknown> = {}) {
  const search = {
    data: undefined,
    status: 'pending',
    error: null,
    refetch: jest.fn(async () => undefined),
    isPlaceholderData: false,
    isFetching: false,
    ...overrides,
  };
  mockedSearchQuery.mockReturnValue(search as unknown as ReturnType<typeof useProductSearchQuery>);
  return search;
}

function mockQuery(overrides: Record<string, unknown> = {}) {
  const query = {
    refresh: jest.fn(async () => undefined),
    fetchNextPage: jest.fn(),
    hasNextPage: true,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    products: [],
    ...overrides,
  };
  mockedQuery.mockReturnValue(query as unknown as ReturnType<typeof useProductsQuery>);
  return query;
}

describe('useProductList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearch();
  });

  it('loads the next page when the end is reached', async () => {
    const query = mockQuery();
    const { result } = await renderHook(() => useProductList(''));

    result.current.onEndReached();

    expect(query.fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['there are no more pages', { hasNextPage: false }],
    ['a page is already loading', { isFetchingNextPage: true }],
    ['the last page failed (retry is manual)', { isFetchNextPageError: true }],
  ])('does not load more when %s', async (_label, overrides) => {
    const query = mockQuery(overrides);
    const { result } = await renderHook(() => useProductList(''));

    result.current.onEndReached();

    expect(query.fetchNextPage).not.toHaveBeenCalled();
  });

  it('shows the refresh spinner only while the user-initiated refresh runs', async () => {
    let finish: () => void = () => undefined;
    mockQuery({ refresh: jest.fn(() => new Promise<void>((resolve) => (finish = resolve))) });
    const { result } = await renderHook(() => useProductList(''));

    let refreshing: Promise<void> = Promise.resolve();
    await act(() => {
      refreshing = result.current.onRefresh();
    });
    expect(result.current.isRefreshing).toBe(true);

    await act(async () => {
      finish();
      await refreshing;
    });
    expect(result.current.isRefreshing).toBe(false);
  });

  it('opens the product details route', async () => {
    mockQuery();
    const { result } = await renderHook(() => useProductList(''));

    result.current.openProduct(42);

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/product/[id]',
      params: { id: '42' },
    });
  });

  describe('while searching', () => {
    it('shows search results and never loads catalog pages', async () => {
      const query = mockQuery();
      mockSearch({
        status: 'success',
        data: { term: 'red', products: [makeProduct(4)], source: 'network' },
      });
      const { result } = await renderHook(() => useProductList('red'));

      result.current.onEndReached();

      expect(result.current.products).toEqual([makeProduct(4)]);
      expect(result.current.hasNextPage).toBe(false);
      expect(query.fetchNextPage).not.toHaveBeenCalled();
    });

    it('keeps the catalog visible, dimmed, until the first results arrive', async () => {
      mockQuery({ products: [makeProduct(1), makeProduct(2)] });
      mockSearch({ status: 'pending', data: undefined });

      const { result } = await renderHook(() => useProductList('red'));

      expect(result.current.products).toHaveLength(2);
      expect(result.current.isStale).toBe(true);
      expect(result.current.status).toBe('success');
    });

    it('shows the search error instead of an empty result when the search fails', async () => {
      mockQuery({ products: [makeProduct(1)] });
      mockSearch({ status: 'error', error: new Error('offline'), data: undefined });

      const { result } = await renderHook(() => useProductList('red'));

      expect(result.current.status).toBe('error');
      expect(result.current.products).toEqual([]);
    });

    it('refreshes the search instead of the catalog', async () => {
      const query = mockQuery();
      const search = mockSearch({
        status: 'success',
        data: { term: 'red', products: [], source: 'network' },
      });
      const { result } = await renderHook(() => useProductList('red'));

      await act(() => result.current.onRefresh());

      expect(search.refetch).toHaveBeenCalled();
      expect(query.refresh).not.toHaveBeenCalled();
    });
  });
});
