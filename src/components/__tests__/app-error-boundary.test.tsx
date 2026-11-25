import { fireEvent, render, screen } from '@testing-library/react-native';

import { setErrorReporter, type ErrorReporter } from '@/lib/error-reporting';

import AppErrorBoundary from '../app-error-boundary';

describe('AppErrorBoundary', () => {
  it('reports the crash and lets the user try again', async () => {
    const reporter: ErrorReporter = {
      captureException: jest.fn(),
      captureMessage: jest.fn(),
      setUser: jest.fn(),
    };
    setErrorReporter(reporter);
    const error = new Error('render failed');
    const retry = jest.fn(async () => undefined);

    await render(<AppErrorBoundary error={error} retry={retry} />);

    expect(screen.getByText('Something went wrong')).toBeOnTheScreen();
    expect(reporter.captureException).toHaveBeenCalledWith(error, { source: 'error-boundary' });

    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalled();
  });
});
