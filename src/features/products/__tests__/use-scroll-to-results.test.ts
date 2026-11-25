import { type FlashListRef } from '@shopify/flash-list';
import { renderHook } from '@testing-library/react-native';

import { useScrollToResults } from '../hooks/use-scroll-to-results';
import { type Product } from '../types';

describe('useScrollToResults', () => {
  it('brings the first results into view whenever the search term changes', async () => {
    const scrollToOffset = jest.fn();
    const { result, rerender } = await renderHook(
      ({ term }: { term: string }) => useScrollToResults(term, () => 120),
      { initialProps: { term: '' } },
    );
    result.current.current = { scrollToOffset } as unknown as FlashListRef<Product>;

    await rerender({ term: 'watch' });
    await rerender({ term: 'watch' });
    await rerender({ term: '' });

    expect(scrollToOffset).toHaveBeenCalledTimes(2);
    expect(scrollToOffset).toHaveBeenCalledWith({ offset: 120, animated: false });
  });

  it('leaves the list alone on the first render', async () => {
    const scrollToOffset = jest.fn();
    const { result, rerender } = await renderHook(() => useScrollToResults('', () => 0));
    result.current.current = { scrollToOffset } as unknown as FlashListRef<Product>;

    await rerender({});

    expect(scrollToOffset).not.toHaveBeenCalled();
  });
});
