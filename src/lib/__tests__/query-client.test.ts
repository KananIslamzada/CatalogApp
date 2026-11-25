import { showToast } from '@/components/ui/toast/show-toast';

import { ApiError } from '../api';
import { queryClient, reportError, shouldRetry } from '../query-client';

jest.mock('@/components/ui/toast/show-toast', () => ({ showToast: jest.fn() }));

const mockedToast = jest.mocked(showToast);

describe('shouldRetry', () => {
  it('retries transient failures a limited number of times', () => {
    const offline = new ApiError('network', 'offline');

    expect(shouldRetry(0, offline)).toBe(true);
    expect(shouldRetry(1, new ApiError('timeout', 'slow'))).toBe(true);
    expect(shouldRetry(0, new ApiError('http', 'down', 502))).toBe(true);
    expect(shouldRetry(2, offline)).toBe(false);
  });

  it('never retries errors that would fail again', () => {
    expect(shouldRetry(0, new ApiError('unauthorized', 'expired', 401))).toBe(false);
    expect(shouldRetry(0, new ApiError('http', 'not found', 404))).toBe(false);
    expect(shouldRetry(0, new ApiError('invalid-response', 'bad shape'))).toBe(false);
    expect(shouldRetry(0, new ApiError('aborted', 'cancelled'))).toBe(false);
    expect(shouldRetry(0, new Error('bug'))).toBe(false);
  });
});

describe('global error toasts', () => {
  beforeEach(() => {
    mockedToast.mockClear();
    queryClient.clear();
  });

  afterAll(() => {
    queryClient.clear();
  });

  it('shows a translated toast for a failed request', () => {
    reportError(new ApiError('network', 'offline'));

    expect(mockedToast).toHaveBeenCalledWith({ type: 'error', title: 'No internet connection' });
  });

  it('stays silent for expired sessions and cancelled requests', () => {
    reportError(new ApiError('unauthorized', 'expired', 401));
    reportError(new ApiError('aborted', 'cancelled'));

    expect(mockedToast).not.toHaveBeenCalled();
  });

  it('toasts when a background refresh fails but data is already on screen', async () => {
    queryClient.setQueryData(['products'], ['cached']);

    await queryClient
      .fetchQuery({
        queryKey: ['products'],
        queryFn: () => Promise.reject(new ApiError('http', 'down', 503)),
        retry: false,
        staleTime: 0,
      })
      .catch(() => undefined);

    expect(mockedToast).toHaveBeenCalledWith({
      type: 'error',
      title: 'Something went wrong on our side',
    });
  });

  it('leaves a failed first load to the screen error state', async () => {
    await queryClient
      .fetchQuery({
        queryKey: ['first-load'],
        queryFn: () => Promise.reject(new ApiError('network', 'offline')),
        retry: false,
      })
      .catch(() => undefined);

    expect(mockedToast).not.toHaveBeenCalled();
  });
});
