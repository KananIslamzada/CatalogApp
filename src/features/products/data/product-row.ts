import { z } from 'zod';

import { type Product } from '../types';

export type ProductRow = {
  id: number;
  title: string;
  description: string;
  category: string;
  brand: string | null;
  price: number;
  discount_percentage: number;
  rating: number;
  stock: number;
  thumbnail: string;
  images: string;
};

const imagesSchema = z.array(z.string());

function parseImages(raw: string): string[] {
  try {
    const result = imagesSchema.safeParse(JSON.parse(raw));
    return result.success ? result.data : [];
  } catch {
    return [];
  }
}

export function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    brand: row.brand ?? undefined,
    price: row.price,
    discountPercentage: row.discount_percentage,
    rating: row.rating,
    stock: row.stock,
    thumbnail: row.thumbnail,
    images: parseImages(row.images),
  };
}

export function productToParams(product: Product, cachedAt: number) {
  return [
    product.id,
    product.title,
    product.description,
    product.category,
    product.brand ?? null,
    product.price,
    product.discountPercentage,
    product.rating,
    product.stock,
    product.thumbnail,
    JSON.stringify(product.images),
    cachedAt,
  ];
}
