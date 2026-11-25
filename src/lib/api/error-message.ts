import { type TranslationKey } from '@/i18n';

import { isApiError } from './api-error';

export function errorMessageKey(error: unknown): TranslationKey {
  if (!isApiError(error)) return 'errors.unknown';

  switch (error.kind) {
    case 'network':
      return 'errors.network';
    case 'timeout':
      return 'errors.timeout';
    case 'http':
      return error.status !== undefined && error.status >= 500 ? 'errors.server' : 'errors.unknown';
    default:
      return 'errors.unknown';
  }
}
