import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import { renderWithQueryClient } from '@/test-utils/query-client';

import { makeProduct } from '../__fixtures__/products';
import FavouritesScreen from '../components/favourites-screen';
import ProductCard from '../components/product-card';
import { addFavourite, readFavourites } from '../data/favourites-repository';
import { type Product } from '../types';

jest.mock('../data/favourites-repository', () => ({
  readFavourites: jest.fn(),
  addFavourite: jest.fn(async () => undefined),
  removeFavourite: jest.fn(async () => undefined),
}));

const mockedRead = jest.mocked(readFavourites);
const mockedAdd = jest.mocked(addFavourite);

describe('favourites UI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('favourites a product from its card', async () => {
    const saved: Product[] = [];
    mockedRead.mockImplementation(async () => [...saved]);
    mockedAdd.mockImplementation(async (product) => {
      saved.push(product);
    });
    await renderWithQueryClient(<ProductCard product={makeProduct(8)} onPress={jest.fn()} />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Add to favourites' }));

    expect(await screen.findByRole('button', { name: 'Remove from favourites' })).toBeOnTheScreen();
    expect(addFavourite).toHaveBeenCalledWith(makeProduct(8));
  });

  it('lists saved favourites', async () => {
    mockedRead.mockResolvedValue([makeProduct(1, { title: 'Red Lipstick' })]);
    await renderWithQueryClient(<FavouritesScreen />);

    expect(await screen.findByText('Red Lipstick')).toBeOnTheScreen();
  });

  it('explains how to add favourites when there are none', async () => {
    mockedRead.mockResolvedValue([]);
    await renderWithQueryClient(<FavouritesScreen />);

    await waitFor(() => expect(screen.getByText('No favourites yet')).toBeOnTheScreen());
  });
});
