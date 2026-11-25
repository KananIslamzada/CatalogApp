import { fireEvent, screen } from '@testing-library/react-native';

import { renderWithQueryClient } from '@/test-utils/query-client';

import { makeProduct } from '../__fixtures__/products';
import { createClientWithFavourites } from '../__fixtures__/query-client';
import ProductCard from '../components/product-card';

jest.mock('../data/favourites-repository', () => ({
  readFavourites: jest.fn(async () => []),
  addFavourite: jest.fn(async () => undefined),
  removeFavourite: jest.fn(async () => undefined),
}));

describe('ProductCard', () => {
  it('shows the product and describes it for screen readers', async () => {
    await renderWithQueryClient(
      <ProductCard
        source="catalog"
        product={makeProduct(1, { title: 'Red Lipstick', price: 12.99, rating: 4.36 })}
        onPress={jest.fn()}
      />,
      createClientWithFavourites(),
    );

    expect(screen.getByText('Red Lipstick')).toBeOnTheScreen();
    expect(screen.getByText('$12.99')).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Red Lipstick, $12.99, rated 4.4 out of 5' }),
    ).toBeOnTheScreen();
  });

  it('falls back to the category when there is no brand', async () => {
    await renderWithQueryClient(
      <ProductCard
        source="catalog"
        product={makeProduct(2, { brand: undefined, category: 'groceries' })}
        onPress={jest.fn()}
      />,
      createClientWithFavourites(),
    );

    expect(screen.getByText('groceries')).toBeOnTheScreen();
  });

  it('shows the discount badge only when there is a discount', async () => {
    const { rerender } = await renderWithQueryClient(
      <ProductCard
        source="catalog"
        product={makeProduct(3, { discountPercentage: 18.19 })}
        onPress={jest.fn()}
      />,
      createClientWithFavourites(),
    );
    expect(screen.getByText('-18%')).toBeOnTheScreen();

    await rerender(
      <ProductCard
        source="catalog"
        product={makeProduct(3, { discountPercentage: 0 })}
        onPress={jest.fn()}
      />,
    );
    expect(screen.queryByText(/%$/)).not.toBeOnTheScreen();
  });

  it('reports which product was tapped', async () => {
    const onPress = jest.fn();
    await renderWithQueryClient(
      <ProductCard source="catalog" product={makeProduct(42)} onPress={onPress} />,
      createClientWithFavourites(),
    );

    await fireEvent.press(screen.getByTestId('product-card-42'));

    expect(onPress).toHaveBeenCalledWith(42);
  });
});
