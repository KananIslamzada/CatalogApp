import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';

import { useSessionStore } from '@/features/auth';
import { makeProduct } from '@/features/products/__fixtures__/products';
import { createClientWithFavourites } from '@/features/products/__fixtures__/query-client';
import { loadProductsPage, searchByName } from '@/features/products/products-service';
import { renderWithQueryClient } from '@/test-utils/query-client';

import CatalogScreen from '@/app/(app)/index';

jest.mock('expo-router', () => ({
  ...jest.requireActual('expo-router'),
  router: { push: jest.fn() },
}));
jest.mock('@/features/products/products-service', () => ({
  ...jest.requireActual('@/features/products/products-service'),
  loadProductsPage: jest.fn(),
  searchByName: jest.fn(),
}));
jest.mock('@/features/products/data/favourites-repository', () => ({
  readFavourites: jest.fn(async () => []),
  addFavourite: jest.fn(async () => undefined),
  removeFavourite: jest.fn(async () => undefined),
}));

const mockedPage = jest.mocked(loadProductsPage);
const mockedSearch = jest.mocked(searchByName);

const lipstick = makeProduct(5, { title: 'Red Lipstick' });
const mascara = makeProduct(1, { title: 'Essence Mascara' });

describe('Catalog screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSessionStore.setState({
      status: 'signedIn',
      user: {
        id: 1,
        username: 'emilys',
        email: 'emily@example.com',
        firstName: 'Emily',
        lastName: 'Johnson',
        image: 'https://example.com/emily.png',
      },
      expired: false,
    });
    mockedPage.mockResolvedValue({
      products: [mascara, lipstick],
      total: 2,
      skip: 0,
      source: 'network',
    });
  });

  it('greets the user and shows the first page of products', async () => {
    await renderWithQueryClient(<CatalogScreen />, createClientWithFavourites());

    expect(await screen.findByText('Essence Mascara')).toBeOnTheScreen();
    expect(screen.getByText('Red Lipstick')).toBeOnTheScreen();
    expect(screen.getByText('Hi, Emily')).toBeOnTheScreen();
    expect(screen.getByText("That's everything")).toBeOnTheScreen();
  });

  it('searches by name after the user stops typing', async () => {
    mockedSearch.mockImplementation(async (term) => ({
      term,
      products: term === 'lip' ? [lipstick] : [],
      source: 'network',
    }));
    await renderWithQueryClient(<CatalogScreen />, createClientWithFavourites());
    await screen.findByText('Essence Mascara');

    await fireEvent.changeText(screen.getByLabelText('Search products'), 'lip');

    await waitFor(() => expect(screen.queryByText('Essence Mascara')).toBeNull());
    expect(screen.getByText('Red Lipstick')).toBeOnTheScreen();
    expect(mockedSearch).toHaveBeenCalledTimes(1);
    expect(mockedSearch).toHaveBeenCalledWith('lip', expect.anything());
  });

  it('says when nothing matches the search', async () => {
    mockedSearch.mockImplementation(async (term) => ({ term, products: [], source: 'network' }));
    await renderWithQueryClient(<CatalogScreen />, createClientWithFavourites());
    await screen.findByText('Essence Mascara');

    await fireEvent.changeText(screen.getByLabelText('Search products'), 'zzz');

    expect(await screen.findByText('No matches')).toBeOnTheScreen();
  });

  it('opens the tapped product', async () => {
    await renderWithQueryClient(<CatalogScreen />, createClientWithFavourites());

    await fireEvent.press(await screen.findByTestId('product-card-5'));

    expect(router.push).toHaveBeenCalledWith({
      pathname: '/product/[id]',
      params: { id: '5', from: 'catalog' },
    });
  });
});
