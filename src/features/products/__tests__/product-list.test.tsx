import { fireEvent, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { useAnimatedScrollHandler } from 'react-native-reanimated';

import { ApiError } from '@/lib/api';

import { renderWithQueryClient } from '@/test-utils/query-client';

import { makeProduct } from '../__fixtures__/products';
import ProductList from '../components/product-list';
import { useProductList } from '../hooks/use-product-list';

jest.mock('../data/favourites-repository', () => ({
  readFavourites: jest.fn(async () => []),
  addFavourite: jest.fn(async () => undefined),
  removeFavourite: jest.fn(async () => undefined),
}));

jest.mock('../hooks/use-product-list', () => ({ useProductList: jest.fn() }));
jest.mock('../components/product-list-skeleton', () => {
  const { Text: MockText } = jest.requireActual('react-native');
  return { __esModule: true, default: () => <MockText>skeleton</MockText> };
});

const mockedUseProductList = jest.mocked(useProductList);

function List({ term }: { term: string }) {
  const onScroll = useAnimatedScrollHandler(() => undefined);
  return <ProductList term={term} onScroll={onScroll} header={<Text>Catalog header</Text>} />;
}

type ListState = ReturnType<typeof useProductList>;

function mockState(overrides: Partial<ListState>) {
  const state = {
    products: [],
    status: 'success',
    error: null,
    refetch: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
    isFetchNextPageError: false,
    isRefreshing: false,
    onRefresh: jest.fn(),
    onEndReached: jest.fn(),
    retryNextPage: jest.fn(),
    openProduct: jest.fn(),
    isSearching: false,
    isStale: false,
    isBusy: false,
    ...overrides,
  };
  mockedUseProductList.mockReturnValue(state as unknown as ListState);
  return state;
}

describe('ProductList', () => {
  it('shows the skeleton while the first page loads', async () => {
    mockState({ status: 'pending' });

    await renderWithQueryClient(<List term="" />);

    expect(screen.getByText('skeleton')).toBeOnTheScreen();
    expect(screen.getByText('Catalog header')).toBeOnTheScreen();
  });

  it('shows a retryable error when nothing could be loaded', async () => {
    const state = mockState({
      status: 'error',
      error: new ApiError('network', 'offline'),
    });

    await renderWithQueryClient(<List term="" />);

    expect(screen.getByText("Couldn't load products")).toBeOnTheScreen();
    expect(screen.getByText('Catalog header')).toBeOnTheScreen();
    expect(screen.getByText('No internet connection')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(state.refetch).toHaveBeenCalled();
  });

  it('shows the empty state when the catalog has no products', async () => {
    mockState({ products: [] });

    await renderWithQueryClient(<List term="" />);

    expect(screen.getByText('No products yet')).toBeOnTheScreen();
  });

  it('renders products and opens the one that was tapped', async () => {
    const state = mockState({
      products: [makeProduct(1, { title: 'Mascara' }), makeProduct(2, { title: 'Lipstick' })],
      hasNextPage: true,
    });

    await renderWithQueryClient(<List term="" />);

    expect(screen.getByText('Mascara')).toBeOnTheScreen();
    expect(screen.getByText('Lipstick')).toBeOnTheScreen();
    await fireEvent.press(screen.getByTestId('product-card-2'));
    expect(state.openProduct).toHaveBeenCalledWith(2);
  });

  it('offers a retry when the next page fails', async () => {
    const state = mockState({
      products: [makeProduct(1)],
      hasNextPage: true,
      isFetchNextPageError: true,
    });

    await renderWithQueryClient(<List term="" />);

    expect(screen.getByText("Couldn't load more")).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(state.retryNextPage).toHaveBeenCalled();
  });

  it('tells the user when the end of the catalog is reached', async () => {
    mockState({ products: [makeProduct(1)], hasNextPage: false });

    await renderWithQueryClient(<List term="" />);

    expect(screen.getByText("That's everything")).toBeOnTheScreen();
  });

  it('explains when a search has no matches', async () => {
    mockState({ products: [], isSearching: true });

    await renderWithQueryClient(<List term="redzz" />);

    expect(screen.getByText('No matches')).toBeOnTheScreen();
    expect(
      screen.getByText('Nothing named \u201credzz\u201d. Try another name.'),
    ).toBeOnTheScreen();
  });

  it('labels a failed search as a search error', async () => {
    mockState({ status: 'error', isSearching: true, error: new ApiError('timeout', 'slow') });

    await renderWithQueryClient(<List term="red" />);

    expect(screen.getByText('Search failed')).toBeOnTheScreen();
  });
});
