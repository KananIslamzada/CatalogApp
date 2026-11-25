import { useCallback } from 'react';
import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const SPRING = { damping: 18, stiffness: 420, mass: 0.6 };

export function usePressScale(pressedScale = 0.96) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [{ scale: scale.get() }],
    }),
    [scale],
  );

  const onPressIn = useCallback(() => {
    scale.set(withSpring(pressedScale, SPRING));
  }, [pressedScale, scale]);

  const onPressOut = useCallback(() => {
    scale.set(withSpring(1, SPRING));
  }, [scale]);

  return { animatedStyle, onPressIn, onPressOut };
}
