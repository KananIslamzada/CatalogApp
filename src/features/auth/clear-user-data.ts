import { Image } from 'expo-image';

import { apiClient } from '@/lib/api';
import { clearDatabase } from '@/lib/database';
import { clearKvStorage } from '@/lib/kv-storage';
import { queryClient } from '@/lib/query-client';

export async function clearUserData(): Promise<void> {
  await queryClient.cancelQueries();
  queryClient.clear();

  const results = await Promise.allSettled([
    apiClient.clearTokens(),
    clearDatabase(),
    Image.clearDiskCache(),
    Image.clearMemoryCache(),
  ]);
  clearKvStorage();

  if (results.some((result) => result.status === 'rejected')) {
    console.warn('Some local data could not be cleared');
  }
}
