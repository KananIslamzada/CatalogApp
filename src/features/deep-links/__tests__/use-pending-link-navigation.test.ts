import { act, renderHook } from '@testing-library/react-native';
import { router } from 'expo-router';

import { usePendingLinkStore } from '../pending-link-store';
import { usePendingLinkNavigation } from '../use-pending-link-navigation';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

const mockedPush = jest.mocked(router.push);

describe('usePendingLinkNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    usePendingLinkStore.getState().clear();
  });

  it('opens a product that was linked before the user signed in', async () => {
    usePendingLinkStore.getState().setPendingProduct(42);

    await renderHook(() => usePendingLinkNavigation());

    expect(mockedPush).toHaveBeenCalledWith({
      pathname: '/product/[id]',
      params: { id: '42' },
    });
    expect(usePendingLinkStore.getState().productId).toBeNull();
  });

  it('opens links that arrive while the app is already signed in', async () => {
    await renderHook(() => usePendingLinkNavigation());
    expect(mockedPush).not.toHaveBeenCalled();

    await act(() => usePendingLinkStore.getState().setPendingProduct(7));

    expect(mockedPush).toHaveBeenCalledTimes(1);
    expect(mockedPush).toHaveBeenCalledWith({
      pathname: '/product/[id]',
      params: { id: '7' },
    });
  });

  it('opens each link only once', async () => {
    usePendingLinkStore.getState().setPendingProduct(42);
    const { rerender } = await renderHook(() => usePendingLinkNavigation());

    await rerender({});

    expect(mockedPush).toHaveBeenCalledTimes(1);
  });
});
