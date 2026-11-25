import { type QueryClient } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { type ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ApiError } from '@/lib/api';
import { createQueryWrapper, createTestQueryClient } from '@/test-utils/query-client';

import ProductDetailsScreen from '../components/product-details-screen';
import { productKeys } from '../hooks/query-keys';
import { loadProduct } from '../products-service';
import { type ProductPage } from '../types';
import { makeProduct } from '../__fixtures__/products';

jest.mock('../products-service', () => ({ loadProduct: jest.fn() }));
jest.mock('../data/favourites-repository', () => ({
  readFavourites: jest.fn(async () => []),
  addFavourite: jest.fn(async () => undefined),
  removeFavourite: jest.fn(async () => undefined),
}));

const mockedLoad = jest.mocked(loadProduct);

const lipstick = makeProduct(42, {
  title: 'Red Lipstick',
  price: 80,
  discountPercentage: 20,
  rating: 4.36,
  stock: 3,
  description: 'A bold red.',
  images: ['https://cdn.test/42/1.webp', 'https://cdn.test/42/2.webp'],
});

describe('ProductDetailsScreen', () => {
  let client: QueryClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = createTestQueryClient();
  });

  function renderScreen(id: number | null) {
    const QueryWrapper = createQueryWrapper(client);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <GestureHandlerRootView>
        <QueryWrapper>{children}</QueryWrapper>
      </GestureHandlerRootView>
    );
    return render(<ProductDetailsScreen id={id} />, { wrapper });
  }

  it('shows price, rating, stock, description and the gallery', async () => {
    mockedLoad.mockResolvedValue({ product: lipstick, source: 'network' });
    await renderScreen(42);

    expect(await screen.findByText('A bold red.')).toBeOnTheScreen();
    expect(screen.getByRole('header', { name: 'Red Lipstick' })).toBeOnTheScreen();
    expect(screen.getByText('$80.00')).toBeOnTheScreen();
    expect(screen.getByLabelText('Was $100.00')).toBeOnTheScreen();
    expect(screen.getByText('-20%')).toBeOnTheScreen();
    expect(screen.getByLabelText('Rated 4.4 out of 5')).toBeOnTheScreen();
    expect(screen.getByText('Only 3 left')).toBeOnTheScreen();
    expect(screen.getByLabelText('Red Lipstick, image 2 of 2')).toBeOnTheScreen();
  });

  it('renders the product from the list right away while it refreshes', async () => {
    mockedLoad.mockReturnValue(new Promise(() => undefined));
    client.setQueryData(productKeys.list(), {
      pages: [{ products: [lipstick], total: 1, skip: 0, source: 'network' } satisfies ProductPage],
      pageParams: [0],
    });
    await renderScreen(42);

    expect(screen.getByText('A bold red.')).toBeOnTheScreen();
    expect(screen.queryByTestId('product-skeleton')).toBeNull();
  });

  it('shows a skeleton while a product opened from a link loads', async () => {
    mockedLoad.mockReturnValue(new Promise(() => undefined));
    await renderScreen(42);

    expect(screen.getByLabelText('Loading product')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Go back' })).toBeOnTheScreen();
  });

  it('says the product does not exist for a 404 or a broken id', async () => {
    mockedLoad.mockRejectedValue(new ApiError('http', 'Not found', 404));
    await renderScreen(9999);
    expect(await screen.findByText('Product not found')).toBeOnTheScreen();

    await screen.rerender(<ProductDetailsScreen id={null} />);
    expect(screen.getByText('Product not found')).toBeOnTheScreen();
  });

  it('offers a retry when loading fails', async () => {
    mockedLoad.mockRejectedValueOnce(new ApiError('network', 'Offline'));
    mockedLoad.mockResolvedValueOnce({ product: lipstick, source: 'network' });
    await renderScreen(42);

    await fireEvent.press(await screen.findByRole('button', { name: 'Try again' }));

    expect(await screen.findByText('A bold red.')).toBeOnTheScreen();
    expect(mockedLoad).toHaveBeenCalledTimes(2);
  });

  it('opens the tapped image full screen', async () => {
    mockedLoad.mockResolvedValue({ product: lipstick, source: 'network' });
    await renderScreen(42);

    await fireEvent.press(await screen.findByTestId('gallery-image-1'));

    expect(screen.getByTestId('image-viewer')).toBeOnTheScreen();
    expect(screen.getByText('2 / 2')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Close' })).toBeOnTheScreen();
  });
});
