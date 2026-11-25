import { useCallback } from 'react';
import { type LayoutChangeEvent } from 'react-native';
import {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

const STRETCH_DISTANCE = 120;
const MAX_STRETCH = 1.08;
const BACKDROP_DISTANCE = 24;

export function useCollapsingHeader() {
  const scrollY = useSharedValue(0);
  const titleHeight = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.set(event.contentOffset.y);
  });

  const onTitleLayout = useCallback(
    (event: LayoutChangeEvent) => titleHeight.set(event.nativeEvent.layout.height),
    [titleHeight],
  );

  const resultsTopOffset = useCallback(
    () => Math.min(scrollY.get(), titleHeight.get()),
    [scrollY, titleHeight],
  );

  const largeTitleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.get(), [0, titleHeight.get() * 0.7], [1, 0], Extrapolation.CLAMP),
    transform: [
      {
        scale: interpolate(
          scrollY.get(),
          [-STRETCH_DISTANCE, 0],
          [MAX_STRETCH, 1],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const inlineTitleStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollY.get(),
      [titleHeight.get() * 0.6, titleHeight.get()],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity: progress, transform: [{ translateY: (1 - progress) * 6 }] };
  });

  const searchStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: Math.max(0, titleHeight.get() - scrollY.get()) }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.get(),
      [titleHeight.get() - BACKDROP_DISTANCE, titleHeight.get()],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  return {
    onScroll,
    onTitleLayout,
    resultsTopOffset,
    largeTitleStyle,
    inlineTitleStyle,
    searchStyle,
    backdropStyle,
  };
}
