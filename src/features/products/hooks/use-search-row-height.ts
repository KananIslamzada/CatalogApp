import { useCallback, useState } from 'react';
import { type LayoutChangeEvent } from 'react-native';

const INITIAL_SEARCH_ROW_HEIGHT = 56;

export function useSearchRowHeight() {
  const [height, setHeight] = useState(INITIAL_SEARCH_ROW_HEIGHT);

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setHeight(Math.round(event.nativeEvent.layout.height));
  }, []);

  return { height, onLayout };
}
