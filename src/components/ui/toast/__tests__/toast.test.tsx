import { act, render, screen } from '@testing-library/react-native';

import { showToast } from '../show-toast';
import ToastHost from '../toast-host';

describe('Toast', () => {
  it('shows a toast with a title and message', async () => {
    await render(<ToastHost />);

    await act(() =>
      showToast({ type: 'error', title: 'No internet connection', message: 'Showing saved data' }),
    );

    expect(screen.getByText('No internet connection')).toBeOnTheScreen();
    expect(screen.getByText('Showing saved data')).toBeOnTheScreen();
    expect(screen.getByRole('alert')).toBeOnTheScreen();
  });
});
