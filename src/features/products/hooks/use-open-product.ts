import { router } from 'expo-router';
import { useCallback } from 'react';

import { type ProductSource } from '../components/shared-image';

export function useOpenProduct(source: ProductSource) {
  return useCallback(
    (id: number) => {
      router.push({ pathname: '/product/[id]', params: { id: String(id), from: source } });
    },
    [source],
  );
}
