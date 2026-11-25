import { act, renderHook } from '@testing-library/react-native';
import { router } from 'expo-router';

import { useProductList } from '../hooks/use-product-list';
import { useProductsQuery } from '../hooks/use-products-query';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('../hooks/use-products-query', () => ({ useProductsQuery: jest.fn() }));

const mockedQuery = jest.mocked(useProductsQuery);

function mockQuery(overrides: Record<string, unknown> = {}) {
  const query = {
    refresh: jest.fn(async () => undefined),
    fetchNextPage: jest.fn(),
    hasNextPage: true,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    ...overrides,
  };
  mockedQuery.mockReturnValue(query as unknown as ReturnType<typeof useProductsQuery>);
  return query;
}

describe('useProductList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads the next page when the end is reached', async () => {
    const query = mockQuery();
    const { result } = await renderHook(() => useProductList());

    result.current.onEndReached();

    expect(query.fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['there are no more pages', { hasNextPage: false }],
    ['a page is already loading', { isFetchingNextPage: true }],
    ['the last page failed (retry is manual)', { isFetchNextPageError: true }],
  ])('does not load more when %s', async (_label, overrides) => {
    const query = mockQuery(overrides);
    const { result } = await renderHook(() => useProductList());

    result.current.onEndReached();

    expect(query.fetchNextPage).not.toHaveBeenCalled();
  });

  it('shows the refresh spinner only while the user-initiated refresh runs', async () => {
    let finish: () => void = () => undefined;
    mockQuery({ refresh: jest.fn(() => new Promise<void>((resolve) => (finish = resolve))) });
    const { result } = await renderHook(() => useProductList());

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
    const { result } = await renderHook(() => useProductList());

    result.current.openProduct(42);

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/product/[id]',
      params: { id: '42' },
    });
  });
});
