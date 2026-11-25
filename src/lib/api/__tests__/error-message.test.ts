import { ApiError } from '../api-error';
import { errorMessageKey } from '../error-message';

describe('errorMessageKey', () => {
  it.each([
    [new ApiError('network', 'offline'), 'errors.network'],
    [new ApiError('timeout', 'slow'), 'errors.timeout'],
    [new ApiError('http', 'boom', 503), 'errors.server'],
    [new ApiError('http', 'bad', 404), 'errors.unknown'],
    [new Error('random'), 'errors.unknown'],
  ])('maps %p to %s', (error, key) => {
    expect(errorMessageKey(error)).toBe(key);
  });
});
