import { ApiError } from '../api';
import { shouldRetry } from '../query-client';

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
