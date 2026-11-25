import { act, renderHook, waitFor } from '@testing-library/react-native';

import { createQueryWrapper, createTestQueryClient } from '@/test-utils/query-client';

import { makeProduct } from '../__fixtures__/products';
import { addFavourite, readFavourites, removeFavourite } from '../data/favourites-repository';
import { favouriteKeys } from '../hooks/query-keys';
import { useFavourites, useIsFavourite, useToggleFavourite } from '../hooks/use-favourites';
import { type Product } from '../types';

jest.mock('../data/favourites-repository', () => ({
  readFavourites: jest.fn(),
  addFavourite: jest.fn(),
  removeFavourite: jest.fn(),
}));

const mockedRead = jest.mocked(readFavourites);
const mockedAdd = jest.mocked(addFavourite);
const mockedRemove = jest.mocked(removeFavourite);

function useFavouritesState(id: number) {
  return {
    favourites: useFavourites().data,
    isFavourite: useIsFavourite(id),
    toggle: useToggleFavourite(),
  };
}

describe('favourites', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows a new favourite before the write finishes', async () => {
    const saved: Product[] = [];
    let finishWrite = () => undefined as void;
    mockedRead.mockImplementation(async () => [...saved]);
    mockedAdd.mockImplementation(
      (product) =>
        new Promise<void>((resolve) => {
          finishWrite = () => {
            saved.push(product);
            resolve();
          };
        }),
    );
    const client = createTestQueryClient();
    const { result } = await renderHook(() => useFavouritesState(5), {
      wrapper: createQueryWrapper(client),
    });
    await waitFor(() => expect(result.current.favourites).toEqual([]));

    await act(async () => {
      result.current.toggle.mutate({ product: makeProduct(5), favourite: true });
    });

    await waitFor(() => expect(result.current.isFavourite).toBe(true));
    expect(mockedAdd).toHaveBeenCalledWith(makeProduct(5));

    await act(async () => finishWrite());
    await waitFor(() => expect(result.current.toggle.isSuccess).toBe(true));
    expect(result.current.favourites?.map((product) => product.id)).toEqual([5]);
  });

  it('puts the favourite back when removing it fails', async () => {
    mockedRead.mockResolvedValue([makeProduct(3)]);
    mockedRemove.mockRejectedValue(new Error('disk full'));
    const client = createTestQueryClient();
    const { result } = await renderHook(() => useFavouritesState(3), {
      wrapper: createQueryWrapper(client),
    });
    await waitFor(() => expect(result.current.isFavourite).toBe(true));

    await act(async () => {
      result.current.toggle.mutate({ product: makeProduct(3), favourite: false });
    });

    await waitFor(() => expect(result.current.toggle.isError).toBe(true));
    expect(result.current.isFavourite).toBe(true);
    expect(client.getQueryData<Product[]>(favouriteKeys.all)?.map((p) => p.id)).toEqual([3]);
  });
});
