import { act, renderHook } from '@testing-library/react-native';

import { useDebouncedValue } from '../use-debounced-value';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('only publishes the value once typing pauses', async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 300),
      { initialProps: { value: '' } },
    );

    await rerender({ value: 'p' });
    await act(() => jest.advanceTimersByTime(200));
    await rerender({ value: 'ph' });
    await act(() => jest.advanceTimersByTime(200));
    await rerender({ value: 'pho' });

    expect(result.current).toBe('');

    await act(() => jest.advanceTimersByTime(300));

    expect(result.current).toBe('pho');
  });
});
