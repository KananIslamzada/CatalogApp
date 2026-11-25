import { Image } from 'expo-image';

import { apiClient } from '@/lib/api';
import { clearDatabase } from '@/lib/database';
import { errorReporter } from '@/lib/error-reporting';
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

  for (const result of results) {
    if (result.status === 'rejected') {
      errorReporter.captureException(result.reason, { area: 'clear-user-data' });
    }
  }
}
