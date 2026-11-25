import { isApiError } from '@/lib/api';

import { fetchProduct, fetchProducts, searchProducts } from './api/products-api';
import {
  readProduct,
  readProductsPage,
  saveProducts,
  searchCachedProducts,
} from './data/products-repository';
import { type Product, type ProductPage, type ProductResult, type SearchResult } from './types';

export function canServeFromCache(error: unknown): boolean {
  if (!isApiError(error)) return false;
  if (error.kind === 'network' || error.kind === 'timeout') return true;
  return error.kind === 'http' && error.status !== undefined && error.status >= 500;
}

async function persist(task: Promise<void>) {
  try {
    await task;
  } catch (error) {
    console.warn('Could not cache products', error);
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

export function matchesName(product: Product, term: string): boolean {
  return product.title.toLowerCase().includes(term.toLowerCase());
}

export async function searchByName(term: string, signal?: AbortSignal): Promise<SearchResult> {
  try {
    const page = await searchProducts(term, signal);
    await persist(saveProducts(page.products));
    const products = page.products.filter((product) => matchesName(product, term));
    return { term, products, source: 'network' };
  } catch (error) {
    if (!canServeFromCache(error)) throw error;
    return { term, products: await searchCachedProducts(term), source: 'cache' };
  }
}
