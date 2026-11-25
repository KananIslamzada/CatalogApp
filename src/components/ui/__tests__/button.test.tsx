import { fireEvent, render, screen } from '@testing-library/react-native';

import Button from '../button';

describe('Button', () => {
  it('calls onPress when tapped', async () => {
    const onPress = jest.fn();
    await render(<Button title="Sign in" onPress={onPress} />);

    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled and busy while loading', async () => {
    const onPress = jest.fn();
    await render(<Button title="Sign in" loading onPress={onPress} />);

    const button = screen.getByRole('button', { name: 'Sign in' });
    await fireEvent.press(button);

    expect(onPress).not.toHaveBeenCalled();
    expect(button).toBeDisabled();
    expect(button).toBeBusy();
  });
});
