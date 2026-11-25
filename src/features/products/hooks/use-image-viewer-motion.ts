import { useCallback, useEffect } from 'react';
import { BackHandler } from 'react-native';
import { usePanGesture } from 'react-native-gesture-handler';
import {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { easeOut } from '@/theme';

const OPEN = { duration: 280, easing: easeOut };
const CLOSE = { duration: 260, easing: easeOut };
const SETTLE = { duration: 200, easing: easeOut };
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 800;
const MIN_DRAG_SCALE = 0.8;

type Options = {
  startOffset: number;
  screenHeight: number;
  onClosed: () => void;
};

export function useImageViewerMotion({ startOffset, screenHeight, onClosed }: Options) {
  const progress = useSharedValue(0);
  const dragY = useSharedValue(0);

  useEffect(() => {
    progress.set(withTiming(1, OPEN));
  }, [progress]);

  const close = useCallback(() => {
    'worklet';
    dragY.set(withTiming(0, CLOSE));
    progress.set(
      withTiming(0, CLOSE, (finished) => {
        if (finished) scheduleOnRN(onClosed);
      }),
    );
  }, [dragY, progress, onClosed]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      close();
      return true;
    });
    return () => subscription.remove();
  }, [close]);

  const dismissGesture = usePanGesture({
    activeOffsetY: [-12, 12],
    failOffsetX: [-12, 12],
    onUpdate: (event) => {
      'worklet';
      dragY.set(event.translationY);
    },
    onDeactivate: (event) => {
      'worklet';
      const shouldClose =
        Math.abs(event.translationY) > DISMISS_DISTANCE ||
        Math.abs(event.velocityY) > DISMISS_VELOCITY;
      if (shouldClose) close();
      else dragY.set(withTiming(0, SETTLE));
    },
  });

  const dragFade = () => {
    'worklet';
    return interpolate(Math.abs(dragY.get()), [0, screenHeight / 2], [1, 0], Extrapolation.CLAMP);
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.get() * dragFade(),
  }));

  const chromeStyle = useAnimatedStyle(() => ({
    opacity: progress.get() * dragFade(),
  }));

  const contentStyle = useAnimatedStyle(() => {
    const dragScale = interpolate(
      Math.abs(dragY.get()),
      [0, screenHeight / 2],
      [1, MIN_DRAG_SCALE],
      Extrapolation.CLAMP,
    );
    return {
      transform: [
        { translateY: (1 - progress.get()) * startOffset + dragY.get() },
        { scale: dragScale },
      ],
    };
  });

  return { close, dismissGesture, backdropStyle, chromeStyle, contentStyle };
}
