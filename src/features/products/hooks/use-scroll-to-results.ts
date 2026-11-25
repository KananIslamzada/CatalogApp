import { type FlashListRef } from '@shopify/flash-list';
import { useEffect, useRef } from 'react';

import { type Product } from '../types';

export function useScrollToResults(term: string, resultsTopOffset: () => number) {
  const listRef = useRef<FlashListRef<Product>>(null);
  const previousTerm = useRef(term);

  useEffect(() => {
    if (previousTerm.current === term) return;
    previousTerm.current = term;
    listRef.current?.scrollToOffset({ offset: resultsTopOffset(), animated: false });
  }, [resultsTopOffset, term]);

  return listRef;
}
