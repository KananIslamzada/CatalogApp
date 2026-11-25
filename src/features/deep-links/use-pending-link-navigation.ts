import { router } from 'expo-router';
import { useEffect } from 'react';

import { usePendingLinkStore } from './pending-link-store';

export function usePendingLinkNavigation() {
  const productId = usePendingLinkStore((state) => state.productId);
  const clear = usePendingLinkStore((state) => state.clear);

  useEffect(() => {
    if (productId === null) return;
    clear();
    router.push({ pathname: '/product/[id]', params: { id: String(productId) } });
  }, [productId, clear]);
}
