import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { showToast } from '@/components/ui/toast/show-toast';
import { t, type TranslationKey } from '@/i18n';

import { errorMessageKey, isApiError } from './api';
import { errorReporter } from './error-reporting';
import { connectOnlineManager } from './network';

const MAX_RETRIES = 2;

export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_RETRIES) return false;
  if (!isApiError(error)) return false;
  if (error.kind === 'network' || error.kind === 'timeout') return true;
  return error.kind === 'http' && error.status !== undefined && error.status >= 500;
}

export function isSilentError(error: unknown): boolean {
  return isApiError(error) && (error.kind === 'unauthorized' || error.kind === 'aborted');
}

export function isExpectedError(error: unknown): boolean {
  if (!isApiError(error)) return false;
  return (
    error.kind === 'network' ||
    error.kind === 'timeout' ||
    error.kind === 'aborted' ||
    error.kind === 'unauthorized'
  );
}

export function reportError(error: unknown, messageKey?: TranslationKey): void {
  if (isSilentError(error)) return;
  showToast({ type: 'error', title: t(messageKey ?? errorMessageKey(error)) });
}

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: { errorKey?: TranslationKey };
  }
}

connectOnlineManager();

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (!isExpectedError(error)) {
        errorReporter.captureException(error, { queryKey: JSON.stringify(query.queryKey) });
      }
      if (query.state.data !== undefined) reportError(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (!isExpectedError(error)) {
        errorReporter.captureException(error, {
          mutationKey: JSON.stringify(mutation.options.mutationKey ?? []),
        });
      }
      reportError(error, mutation.meta?.errorKey);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: shouldRetry,
    },
    mutations: {
      retry: false,
    },
  },
});
