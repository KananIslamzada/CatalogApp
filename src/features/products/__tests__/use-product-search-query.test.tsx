import { type QueryClient } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { createQueryWrapper, createTestQueryClient } from '@/test-utils/query-client';

import { makeProduct } from '../__fixtures__/products';
import { useProductSearchQuery } from '../hooks/use-product-search-query';
import { searchByName } from '../products-service';
import { type SearchResult } from '../types';

jest.mock('../products-service', () => ({ searchByName: jest.fn() }));

const mockedSearch = jest.mocked(searchByName);

function deferred() {
  let resolve: (value: SearchResult) => void = () => undefined;
  const promise = new Promise<SearchResult>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe('useProductSearchQuery', () => {
  let client: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = createTestQueryClient();
  });

  afterEach(() => {
    client.clear();
  });

  it('does not search for an empty term', async () => {
    await renderHook(() => useProductSearchQuery(''), { wrapper: createQueryWrapper(client) });

    expect(mockedSearch).not.toHaveBeenCalled();
  });

  it('never lets a slow response for an old term replace newer results', async () => {
    const slowOld = deferred();
    const fastNew = deferred();
    const signals: AbortSignal[] = [];
    mockedSearch.mockImplementation((term, signal) => {
      if (signal) signals.push(signal);
      return term === 'pho' ? slowOld.promise : fastNew.promise;
    });

    const { result, rerender } = await renderHook(
      ({ term }: { term: string }) => useProductSearchQuery(term),
      { initialProps: { term: 'pho' }, wrapper: createQueryWrapper(client) },
    );
    await rerender({ term: 'phone' });

    const phoneResults = { term: 'phone', products: [makeProduct(1)], source: 'network' as const };
    await act(async () => fastNew.resolve(phoneResults));
    await waitFor(() => expect(result.current.data).toEqual(phoneResults));

    await act(async () =>
      slowOld.resolve({ term: 'pho', products: [makeProduct(2)], source: 'network' }),
    );

    expect(result.current.data).toEqual(phoneResults);
    expect(signals[0]?.aborted).toBe(true);
  });

  it('keeps showing the previous results, marked stale, while the next term loads', async () => {
    const next = deferred();
    mockedSearch.mockImplementation(async (term) =>
      term === 'red'
        ? { term: 'red', products: [makeProduct(4)], source: 'network' }
        : next.promise,
    );

    const { result, rerender } = await renderHook(
      ({ term }: { term: string }) => useProductSearchQuery(term),
      { initialProps: { term: 'red' }, wrapper: createQueryWrapper(client) },
    );
    await waitFor(() => expect(result.current.data?.term).toBe('red'));

    await rerender({ term: 'redd' });

    expect(result.current.data?.term).toBe('red');
    expect(result.current.isPlaceholderData).toBe(true);
  });
});
