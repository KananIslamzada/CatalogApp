import { type Product } from '../types';

export function makeProduct(id: number, overrides: Partial<Product> = {}): Product {
  return {
    id,
    title: `Product ${id}`,
    description: `Description ${id}`,
    category: 'beauty',
    brand: 'Brand',
    price: 9.99,
    discountPercentage: 10,
    rating: 4.5,
    stock: 12,
    thumbnail: `https://cdn.test/${id}/thumb.webp`,
    images: [`https://cdn.test/${id}/1.webp`],
    ...overrides,
  };
}
