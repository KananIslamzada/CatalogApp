import { ApiError } from '../api';
import { errorReporter, setErrorReporter, type ErrorReporter } from '../error-reporting';
import { isExpectedError } from '../query-client';

function fakeReporter(): jest.Mocked<ErrorReporter> {
  return { captureException: jest.fn(), captureMessage: jest.fn(), setUser: jest.fn() };
}

describe('error reporting', () => {
  it('forwards everything to the reporter that is plugged in', () => {
    const reporter = fakeReporter();
    setErrorReporter(reporter);
    const error = new Error('boom');

    errorReporter.captureException(error, { area: 'test' });
    errorReporter.captureMessage('hello');
    errorReporter.setUser({ id: 7 });

    expect(reporter.captureException).toHaveBeenCalledWith(error, { area: 'test' });
    expect(reporter.captureMessage).toHaveBeenCalledWith('hello', undefined);
    expect(reporter.setUser).toHaveBeenCalledWith({ id: 7 });
  });

  it('does not treat offline, timeouts, cancellations or expired sessions as bugs', () => {
    expect(isExpectedError(new ApiError('network', 'offline'))).toBe(true);
    expect(isExpectedError(new ApiError('timeout', 'slow'))).toBe(true);
    expect(isExpectedError(new ApiError('aborted', 'cancelled'))).toBe(true);
    expect(isExpectedError(new ApiError('unauthorized', 'expired', 401))).toBe(true);

    expect(isExpectedError(new ApiError('http', 'server', 500))).toBe(false);
    expect(isExpectedError(new ApiError('invalid-response', 'bad shape'))).toBe(false);
    expect(isExpectedError(new Error('disk full'))).toBe(false);
  });
});
