import { fireEvent, render, screen } from '@testing-library/react-native';

import TextField from '../text-field';

describe('TextField', () => {
  it('shows the error message', async () => {
    await render(<TextField label="Username" error="Username is required" />);

    expect(screen.getByText('Username is required')).toBeOnTheScreen();
  });

  it('toggles password visibility', async () => {
    await render(<TextField label="Password" secureTextEntry />);

    const input = screen.getByLabelText('Password');
    expect(input).toHaveProp('secureTextEntry', true);

    await fireEvent.press(screen.getByRole('button', { name: 'Show password' }));

    expect(input).toHaveProp('secureTextEntry', false);
    expect(screen.getByRole('button', { name: 'Hide password' })).toBeOnTheScreen();
  });
});
