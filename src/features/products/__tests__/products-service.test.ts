import { ApiError } from '@/lib/api';

import { fetchProduct, fetchProducts } from '../api/products-api';
import { readProduct, readProductsPage, saveProducts } from '../data/products-repository';
import { loadProduct, loadProductsPage } from '../products-service';
import { makeProduct } from '../__fixtures__/products';

jest.mock('../api/products-api', () => ({ fetchProducts: jest.fn(), fetchProduct: jest.fn() }));
jest.mock('../data/products-repository', () => ({
  saveProducts: jest.fn(),
  readProductsPage: jest.fn(),
  readProduct: jest.fn(),
}));

const api = { fetchProducts: jest.mocked(fetchProducts), fetchProduct: jest.mocked(fetchProduct) };
const repo = {
  saveProducts: jest.mocked(saveProducts),
  readProductsPage: jest.mocked(readProductsPage),
  readProduct: jest.mocked(readProduct),
};

const offline = new ApiError('network', 'Network request failed');
const networkPage = { products: [makeProduct(1), makeProduct(2)], total: 194, skip: 0, limit: 20 };

describe('loadProductsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the network page and caches it', async () => {
    api.fetchProducts.mockResolvedValue(networkPage);

    const page = await loadProductsPage({ skip: 0, limit: 20 });

    expect(page).toEqual({
      products: networkPage.products,
      total: 194,
      skip: 0,
      source: 'network',
    });
    expect(repo.saveProducts).toHaveBeenCalledWith(networkPage.products);
  });

  it('still returns fresh data when caching fails', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    api.fetchProducts.mockResolvedValue(networkPage);
    repo.saveProducts.mockRejectedValue(new Error('disk full'));

    await expect(loadProductsPage({ skip: 0, limit: 20 })).resolves.toMatchObject({
      source: 'network',
    });
  });

  it.each([
    ['offline', offline],
    ['a timeout', new ApiError('timeout', 'slow')],
    ['a server error', new ApiError('http', 'down', 503)],
  ])('serves the cached page on %s', async (_label, error) => {
    api.fetchProducts.mockRejectedValue(error);
    repo.readProductsPage.mockResolvedValue({ products: [makeProduct(21)], total: 40 });

    const page = await loadProductsPage({ skip: 20, limit: 20 });

    expect(repo.readProductsPage).toHaveBeenCalledWith(20, 20);
    expect(page).toEqual({ products: [makeProduct(21)], total: 40, skip: 20, source: 'cache' });
  });

  it('fails with the original error when offline with nothing cached', async () => {
    api.fetchProducts.mockRejectedValue(offline);
    repo.readProductsPage.mockResolvedValue({ products: [], total: 0 });

    await expect(loadProductsPage({ skip: 0, limit: 20 })).rejects.toBe(offline);
  });

  it('ends the list instead of failing when a later page is not cached', async () => {
    api.fetchProducts.mockRejectedValue(offline);
    repo.readProductsPage.mockResolvedValue({ products: [], total: 40 });

    await expect(loadProductsPage({ skip: 40, limit: 20 })).resolves.toMatchObject({
      products: [],
      source: 'cache',
    });
  });

  it.each([
    ['unauthorized', new ApiError('unauthorized', 'Session expired', 401)],
    ['cancelled', new ApiError('aborted', 'cancelled')],
    ['not found', new ApiError('http', 'missing', 404)],
  ])('does not hide %s errors behind the cache', async (_label, error) => {
    api.fetchProducts.mockRejectedValue(error);

    await expect(loadProductsPage({ skip: 0, limit: 20 })).rejects.toBe(error);
    expect(repo.readProductsPage).not.toHaveBeenCalled();
  });
});

describe('loadProduct', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns and caches the fresh product', async () => {
    api.fetchProduct.mockResolvedValue(makeProduct(42));

    await expect(loadProduct(42)).resolves.toEqual({ product: makeProduct(42), source: 'network' });
    expect(repo.saveProducts).toHaveBeenCalledWith([makeProduct(42)]);
  });

  it('serves a previously seen product while offline', async () => {
    api.fetchProduct.mockRejectedValue(offline);
    repo.readProduct.mockResolvedValue(makeProduct(42));

    await expect(loadProduct(42)).resolves.toEqual({ product: makeProduct(42), source: 'cache' });
  });

  it('fails while offline for a product that was never loaded', async () => {
    api.fetchProduct.mockRejectedValue(offline);
    repo.readProduct.mockResolvedValue(null);

    await expect(loadProduct(42)).rejects.toBe(offline);
  });
});
