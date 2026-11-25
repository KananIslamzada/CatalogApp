import { config } from '../config';
import { tokenStorage } from '../secure-storage';
import { createApiClient } from './api-client';

export const apiClient = createApiClient({
  baseUrl: config.apiUrl,
  tokenStore: tokenStorage,
  tokenLifetimeMins: config.tokenLifetimeMins,
});

export {
  createApiClient,
  type ApiClient,
  type QueryParams,
  type RequestOptions,
} from './api-client';
export { ApiError, isApiError, type ApiErrorKind } from './api-error';
