import { useState } from 'react';

import { useDebouncedValue } from '@/hooks/use-debounced-value';

export const SEARCH_DEBOUNCE_MS = 300;

export function useCatalogSearch() {
  const [query, setQuery] = useState('');
  const trimmed = query.trim();
  const debounced = useDebouncedValue(trimmed, SEARCH_DEBOUNCE_MS);
  const term = trimmed === '' ? '' : debounced;

  return { query, setQuery, term };
}
