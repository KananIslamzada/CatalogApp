import { act, fireEvent, render, screen } from '@testing-library/react-native';

import AppDialogHost from '../app-dialog-host';
import { showAppDialog, useDialogStore } from '../dialog-store';

describe('AppDialog', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useDialogStore.setState({ current: null, queue: [] });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows a dialog requested before the host mounted', async () => {
    showAppDialog({ title: 'Link not supported', message: 'Try another link.' });

    await render(<AppDialogHost />);

    expect(screen.getByText('Link not supported')).toBeOnTheScreen();
    expect(screen.getByText('Try another link.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'OK' })).toBeOnTheScreen();
  });

  it('runs the chosen action only after the dialog has closed', async () => {
    const onPress = jest.fn();
    await render(<AppDialogHost />);
    await act(() =>
      showAppDialog({ title: 'Sign out?', actions: [{ label: 'Sign out', onPress }] }),
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Sign out' }));
    expect(onPress).not.toHaveBeenCalled();

    await act(() => jest.advanceTimersByTime(500));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(useDialogStore.getState().current).toBeNull();
  });

  it('queues dialogs and shows them one at a time', async () => {
    await render(<AppDialogHost />);
    await act(() => {
      showAppDialog({ title: 'First' });
      showAppDialog({ title: 'Second' });
    });

    expect(screen.getByText('First')).toBeOnTheScreen();
    expect(screen.queryByText('Second')).not.toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'OK' }));
    await act(() => jest.advanceTimersByTime(500));

    expect(screen.getByText('Second')).toBeOnTheScreen();
  });
});
