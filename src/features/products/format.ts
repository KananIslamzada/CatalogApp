const priceFormatters = new Map<string, Intl.NumberFormat>();

export function formatPrice(value: number, locale: string): string {
  let formatter = priceFormatters.get(locale);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' });
    priceFormatters.set(locale, formatter);
  }
  return formatter.format(value);
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function discountPercent(discountPercentage: number): number | null {
  const rounded = Math.round(discountPercentage);
  return rounded >= 1 ? rounded : null;
}

export function originalPrice(price: number, discountPercentage: number): number | null {
  if (discountPercent(discountPercentage) === null || discountPercentage >= 100) return null;
  return price / (1 - discountPercentage / 100);
}

export type StockLevel = 'out' | 'low' | 'in';

export const LOW_STOCK = 5;

export function stockLevel(stock: number): StockLevel {
  if (stock <= 0) return 'out';
  if (stock <= LOW_STOCK) return 'low';
  return 'in';
}
