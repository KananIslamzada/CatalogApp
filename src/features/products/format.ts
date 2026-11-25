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
