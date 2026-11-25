import { parseDeepLink, parseProductId } from '../parse-deep-link';

describe('parseDeepLink', () => {
  it.each([
    ['catalog://product/42', 42],
    ['catalog://product/42/', 42],
    ['catalog://product/42?ref=mail', 42],
    ['/product/7', 7],
    ['product/7', 7],
  ])('reads the product id from %s', (path, id) => {
    expect(parseDeepLink(path)).toEqual({ kind: 'product', id });
  });

  it.each([
    'catalog://product/abc',
    'catalog://product/0',
    'catalog://product/-3',
    'catalog://product/',
    'catalog://product/42/reviews',
    'catalog://product/99999999999999999999',
  ])('marks %s as a broken product link', (path) => {
    expect(parseDeepLink(path)).toEqual({ kind: 'invalid-product' });
  });

  it.each(['catalog://', 'catalog:///', '/', 'catalog://login', 'catalog://login?x=1'])(
    'lets %s through to normal routing',
    (path) => {
      expect(parseDeepLink(path)).toEqual({ kind: 'passthrough' });
    },
  );

  it.each(['catalog://products/42', 'catalog://settings', 'catalog://login/extra'])(
    'treats %s as unknown',
    (path) => {
      expect(parseDeepLink(path)).toEqual({ kind: 'unknown' });
    },
  );
});

describe('parseProductId', () => {
  it('accepts positive integers only', () => {
    expect(parseProductId('42')).toBe(42);
    expect(parseProductId('4.2')).toBeNull();
    expect(parseProductId('')).toBeNull();
    expect(parseProductId(undefined)).toBeNull();
  });
});
