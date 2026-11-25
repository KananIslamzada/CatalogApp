import { fireEvent, render, screen } from '@testing-library/react-native';

import { login } from '@/features/auth/api/auth-api';
import { useSessionStore } from '@/features/auth';
import { ApiError } from '@/lib/api';

import LoginScreen from '../login';

jest.mock('@/features/auth/api/auth-api', () => ({ login: jest.fn() }));
jest.mock('@/lib/secure-storage', () => ({
  tokenStorage: {
    read: jest.fn(async () => null),
    save: jest.fn(async () => undefined),
    clear: jest.fn(async () => undefined),
  },
}));

const mockedLogin = jest.mocked(login);

const emily = {
  id: 1,
  username: 'emilys',
  email: 'emily@example.com',
  firstName: 'Emily',
  lastName: 'Johnson',
  image: 'https://example.com/emily.png',
};

async function submit(username: string, password: string) {
  await fireEvent.changeText(screen.getByLabelText('Username'), username);
  await fireEvent.changeText(screen.getByLabelText('Password'), password);
  await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
}

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSessionStore.setState({ status: 'signedOut', user: null, expired: false });
  });

  it('shows validation errors and does not call the API for an empty form', async () => {
    await render(<LoginScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Enter your username')).toBeOnTheScreen();
    expect(screen.getByText('Enter your password')).toBeOnTheScreen();
    expect(mockedLogin).not.toHaveBeenCalled();
  });

  it('signs in with a trimmed username', async () => {
    mockedLogin.mockResolvedValue({
      user: emily,
      tokens: { accessToken: 'access', refreshToken: 'refresh' },
    });
    await render(<LoginScreen />);

    await submit('  emilys ', 'emilyspass');

    expect(mockedLogin).toHaveBeenCalledWith({ username: 'emilys', password: 'emilyspass' });
    expect(useSessionStore.getState().status).toBe('signedIn');
  });

  it('shows a friendly message for wrong credentials', async () => {
    mockedLogin.mockRejectedValue(new ApiError('http', 'Invalid credentials', 400));
    await render(<LoginScreen />);

    await submit('emilys', 'wrong');

    expect(await screen.findByText('Wrong username or password')).toBeOnTheScreen();
    expect(useSessionStore.getState().status).toBe('signedOut');
  });

  it('tells the user when they are offline', async () => {
    mockedLogin.mockRejectedValue(new ApiError('network', 'Network request failed'));
    await render(<LoginScreen />);

    await submit('emilys', 'emilyspass');

    expect(await screen.findByText('No internet connection')).toBeOnTheScreen();
  });

  it('explains why the user was signed out after the session expired', async () => {
    useSessionStore.setState({ expired: true });
    await render(<LoginScreen />);

    expect(screen.getByText('Your session expired. Please sign in again.')).toBeOnTheScreen();
  });
});
