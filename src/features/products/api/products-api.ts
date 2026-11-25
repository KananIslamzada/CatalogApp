import { apiClient } from '@/lib/api';

import { productPageSchema, productSchema, type Product } from '../types';

const PRODUCT_FIELDS = [
  'title',
  'description',
  'category',
  'brand',
  'price',
  'discountPercentage',
  'rating',
  'stock',
  'thumbnail',
  'images',
].join(',');

type PageParams = {
  skip: number;
  limit: number;
  signal?: AbortSignal;
};

export function fetchProducts({ skip, limit, signal }: PageParams) {
  return apiClient.request('/auth/products', productPageSchema, {
    query: { skip, limit, select: PRODUCT_FIELDS },
    signal,
  });
}

export function fetchProduct(id: number, signal?: AbortSignal): Promise<Product> {
  return apiClient.request(`/auth/products/${id}`, productSchema, {
    query: { select: PRODUCT_FIELDS },
    signal,
  });
}

export function searchProducts(term: string, signal?: AbortSignal) {
  return apiClient.request('/auth/products/search', productPageSchema, {
    query: { q: term, limit: 0, select: PRODUCT_FIELDS },
    signal,
  });
}
