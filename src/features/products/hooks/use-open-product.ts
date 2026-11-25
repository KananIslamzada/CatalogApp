import { router } from 'expo-router';
import { useCallback } from 'react';

export function useOpenProduct() {
  return useCallback((id: number) => {
    router.push({ pathname: '/product/[id]', params: { id: String(id) } });
  }, []);
}
