import { parseProductLink } from '../parse-product-link';

describe('parseProductLink', () => {
  it.each([
    ['catalog://product/42', 42],
    ['catalog://product/42/', 42],
    ['catalog://product/42?ref=mail', 42],
    ['/product/7', 7],
    ['product/7', 7],
    ['https://catalog.example.com/product/15', 15],
  ])('reads the id from %s', (path, id) => {
    expect(parseProductLink(path)).toBe(id);
  });

  it.each([
    'catalog://product/abc',
    'catalog://product/0',
    'catalog://product/-3',
    'catalog://product/',
    'catalog://products/42',
    'catalog://product/42/reviews',
    'catalog://',
    '/',
    'catalog://product/99999999999999999999',
  ])('rejects %s', (path) => {
    expect(parseProductLink(path)).toBeNull();
  });
});
