import { productToParams, rowToProduct, type ProductRow } from '../data/product-row';
import { makeProduct } from '../__fixtures__/products';

function toRow(params: unknown[]): ProductRow {
  const [id, title, description, category, brand, price, discount, rating, stock, thumb, images] =
    params;
  return {
    id: id as number,
    title: title as string,
    description: description as string,
    category: category as string,
    brand: brand as string | null,
    price: price as number,
    discount_percentage: discount as number,
    rating: rating as number,
    stock: stock as number,
    thumbnail: thumb as string,
    images: images as string,
  };
}

describe('product rows', () => {
  it('round-trips a product through a database row', () => {
    const product = makeProduct(1, { images: ['a.webp', 'b.webp'] });

    expect(rowToProduct(toRow(productToParams(product, 1)))).toEqual(product);
  });

  it('stores a missing brand as NULL and reads it back as undefined', () => {
    const product = makeProduct(2, { brand: undefined });
    const params = productToParams(product, 1);

    expect(params[4]).toBeNull();
    expect(rowToProduct(toRow(params)).brand).toBeUndefined();
  });

  it('falls back to no images when the stored JSON is corrupted', () => {
    const row = toRow(productToParams(makeProduct(3), 1));

    expect(rowToProduct({ ...row, images: '{oops' }).images).toEqual([]);
    expect(rowToProduct({ ...row, images: '[1,2]' }).images).toEqual([]);
  });
});
