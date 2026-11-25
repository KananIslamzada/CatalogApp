import {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

const FADE_DISTANCE = 32;

export function useProductDetailScroll(galleryHeight: number, barBottom: number) {
  const scrollY = useSharedValue(0);
  const collapsedAt = galleryHeight - barBottom;

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.set(event.contentOffset.y);
  });

  const galleryStyle = useAnimatedStyle(() => {
    const overscroll = Math.min(0, scrollY.get());
    return {
      transform: [
        { translateY: overscroll / 2 },
        { scale: galleryHeight > 0 ? 1 - overscroll / galleryHeight : 1 },
      ],
    };
  });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.get(),
      [collapsedAt - FADE_DISTANCE, collapsedAt],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const titleStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollY.get(),
      [collapsedAt, collapsedAt + FADE_DISTANCE],
      [0, 1],
      Extrapolation.CLAMP,
    );
    return { opacity: progress, transform: [{ translateY: (1 - progress) * 6 }] };
  });

  return { onScroll, galleryStyle, backdropStyle, titleStyle };
}
