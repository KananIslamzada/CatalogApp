import { isApiError } from '@/lib/api';

import { fetchProduct, fetchProducts } from './api/products-api';
import { readProduct, readProductsPage, saveProducts } from './data/products-repository';
import { type ProductPage, type ProductResult } from './types';

export function canServeFromCache(error: unknown): boolean {
  if (!isApiError(error)) return false;
  if (error.kind === 'network' || error.kind === 'timeout') return true;
  return error.kind === 'http' && error.status !== undefined && error.status >= 500;
}

async function persist(task: Promise<void>) {
  try {
    await task;
  } catch {
    console.warn('Could not cache products');
  }
}

export async function loadProductsPage(params: {
  skip: number;
  limit: number;
  signal?: AbortSignal;
}): Promise<ProductPage> {
  try {
    const page = await fetchProducts(params);
    await persist(saveProducts(page.products));
    return { products: page.products, total: page.total, skip: page.skip, source: 'network' };
  } catch (error) {
    if (!canServeFromCache(error)) throw error;

    const cached = await readProductsPage(params.skip, params.limit);
    if (params.skip === 0 && cached.products.length === 0) throw error;
    return { ...cached, skip: params.skip, source: 'cache' };
  }
}

export async function loadProduct(id: number, signal?: AbortSignal): Promise<ProductResult> {
  try {
    const product = await fetchProduct(id, signal);
    await persist(saveProducts([product]));
    return { product, source: 'network' };
  } catch (error) {
    if (!canServeFromCache(error)) throw error;

    const cached = await readProduct(id);
    if (!cached) throw error;
    return { product: cached, source: 'cache' };
  }
}
