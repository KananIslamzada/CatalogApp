import { discountPercent, formatPrice, formatRating, originalPrice, stockLevel } from '../format';

describe('product formatting', () => {
  it('formats prices as US dollars for the locale', () => {
    expect(formatPrice(9.99, 'en')).toBe('$9.99');
    expect(formatPrice(15999.99, 'en')).toBe('$15,999.99');
  });

  it('shows ratings with one decimal', () => {
    expect(formatRating(4.567)).toBe('4.6');
    expect(formatRating(3)).toBe('3.0');
  });

  it('only shows a discount badge for at least 1%', () => {
    expect(discountPercent(10.48)).toBe(10);
    expect(discountPercent(0.4)).toBeNull();
    expect(discountPercent(0)).toBeNull();
  });

  it('works out the price before the discount', () => {
    expect(originalPrice(80, 20)).toBeCloseTo(100);
    expect(originalPrice(9.99, 0.4)).toBeNull();
    expect(originalPrice(10, 100)).toBeNull();
  });

  it('groups stock into in, low and out', () => {
    expect(stockLevel(0)).toBe('out');
    expect(stockLevel(5)).toBe('low');
    expect(stockLevel(6)).toBe('in');
  });
});
