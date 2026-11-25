import { render, screen } from '@testing-library/react-native';
import { useNetworkState, type NetworkState } from 'expo-network';
import { AccessibilityInfo } from 'react-native';

import OfflineBanner from '../offline-banner';

jest.mock('expo-network', () => ({
  ...jest.requireActual('expo-network'),
  useNetworkState: jest.fn(),
}));

const mockedNetworkState = jest.mocked(useNetworkState);

function setNetwork(state: NetworkState) {
  mockedNetworkState.mockReturnValue(state);
}

describe('OfflineBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stays hidden while online', async () => {
    setNetwork({ isConnected: true, isInternetReachable: true });
    await render(<OfflineBanner />);

    expect(screen.queryByTestId('offline-banner')).toBeNull();
  });

  it('tells the user they are offline and announces changes', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    setNetwork({ isConnected: true, isInternetReachable: true });
    await render(<OfflineBanner />);

    setNetwork({ isConnected: false });
    await screen.rerender(<OfflineBanner />);

    expect(screen.getByText("You're offline")).toBeOnTheScreen();
    expect(screen.getByText('Showing saved products')).toBeOnTheScreen();
    expect(announce).toHaveBeenCalledWith("You're offline");

    setNetwork({ isConnected: true, isInternetReachable: true });
    await screen.rerender(<OfflineBanner />);

    expect(announce).toHaveBeenLastCalledWith('Back online');
  });
});
