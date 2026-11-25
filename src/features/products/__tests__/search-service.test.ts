import { ApiError } from '@/lib/api';

import { makeProduct } from '../__fixtures__/products';
import { searchProducts } from '../api/products-api';
import { saveProducts, searchCachedProducts } from '../data/products-repository';
import { matchesName, searchByName } from '../products-service';

jest.mock('../api/products-api', () => ({ searchProducts: jest.fn() }));
jest.mock('../data/products-repository', () => ({
  saveProducts: jest.fn(),
  searchCachedProducts: jest.fn(),
}));

const mockedSearch = jest.mocked(searchProducts);
const mockedSave = jest.mocked(saveProducts);
const mockedCachedSearch = jest.mocked(searchCachedProducts);

const lipstick = makeProduct(4, { title: 'Red Lipstick' });
const charger = makeProduct(9, {
  title: 'Apple iPhone Charger',
  description: 'Charges your phone fast',
});
const headset = makeProduct(10, {
  title: 'Wireless Headset',
  description: 'Pairs with any phone',
});

describe('matchesName', () => {
  it('matches the title case-insensitively', () => {
    expect(matchesName(lipstick, 'red')).toBe(true);
    expect(matchesName(lipstick, 'LIP')).toBe(true);
    expect(matchesName(lipstick, 'blue')).toBe(false);
  });
});

describe('searchByName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('keeps only products whose name matches, even if the API matched the description', async () => {
    mockedSearch.mockResolvedValue({ products: [charger, headset], total: 2, skip: 0, limit: 2 });

    const result = await searchByName('phone');

    expect(result).toEqual({ term: 'phone', products: [charger], source: 'network' });
    expect(mockedSave).toHaveBeenCalledWith([charger, headset]);
  });

  it('searches the offline cache by name when the network is down', async () => {
    mockedSearch.mockRejectedValue(new ApiError('network', 'offline'));
    mockedCachedSearch.mockResolvedValue([lipstick]);

    const result = await searchByName('red');

    expect(mockedCachedSearch).toHaveBeenCalledWith('red');
    expect(result).toEqual({ term: 'red', products: [lipstick], source: 'cache' });
  });

  it('does not hide cancellations behind the cache', async () => {
    const cancelled = new ApiError('aborted', 'cancelled');
    mockedSearch.mockRejectedValue(cancelled);

    await expect(searchByName('red')).rejects.toBe(cancelled);
    expect(mockedCachedSearch).not.toHaveBeenCalled();
  });
});
