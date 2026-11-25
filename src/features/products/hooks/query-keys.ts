export const productKeys = {
  all: ['products'] as const,
  list: () => [...productKeys.all, 'list'] as const,
  detail: (id: number) => [...productKeys.all, 'detail', id] as const,
  searches: () => [...productKeys.all, 'search'] as const,
  search: (term: string) => [...productKeys.searches(), term] as const,
};

export const favouriteKeys = {
  all: ['favourites'] as const,
};
