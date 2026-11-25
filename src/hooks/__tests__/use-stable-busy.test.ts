import { act, renderHook } from '@testing-library/react-native';

import { useStableBusy } from '../use-stable-busy';

describe('useStableBusy', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('never shows a busy state that ends before the delay', async () => {
    const { result, rerender } = await renderHook(
      ({ busy }: { busy: boolean }) => useStableBusy(busy),
      {
        initialProps: { busy: true },
      },
    );

    await act(() => jest.advanceTimersByTime(100));
    await rerender({ busy: false });
    await act(() => jest.advanceTimersByTime(500));

    expect(result.current).toBe(false);
  });

  it('shows after the delay and stays for the minimum time', async () => {
    const { result, rerender } = await renderHook(
      ({ busy }: { busy: boolean }) => useStableBusy(busy),
      {
        initialProps: { busy: true },
      },
    );

    await act(() => jest.advanceTimersByTime(150));
    expect(result.current).toBe(true);

    await act(() => jest.advanceTimersByTime(50));
    await rerender({ busy: false });
    await act(() => jest.advanceTimersByTime(300));
    expect(result.current).toBe(true);

    await act(() => jest.advanceTimersByTime(100));
    expect(result.current).toBe(false);
  });

  it('hides right away when it has already been visible long enough', async () => {
    const { result, rerender } = await renderHook(
      ({ busy }: { busy: boolean }) => useStableBusy(busy),
      {
        initialProps: { busy: true },
      },
    );

    await act(() => jest.advanceTimersByTime(1_000));
    await rerender({ busy: false });
    await act(() => jest.advanceTimersByTime(0));

    expect(result.current).toBe(false);
  });

  it('can show immediately while still avoiding a blink', async () => {
    const options = { delayMs: 0, minVisibleMs: 300 };
    const { result, rerender } = await renderHook(
      ({ busy }: { busy: boolean }) => useStableBusy(busy, options),
      { initialProps: { busy: true } },
    );

    await act(() => jest.advanceTimersByTime(0));
    expect(result.current).toBe(true);

    await rerender({ busy: false });
    await act(() => jest.advanceTimersByTime(200));
    expect(result.current).toBe(true);

    await act(() => jest.advanceTimersByTime(100));
    expect(result.current).toBe(false);
  });
});
