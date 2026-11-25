import { LinearGradient } from 'expo-linear-gradient';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { useTheme } from '@/theme';

const GRADIENT_START = { x: 0, y: 0.5 };
const GRADIENT_END = { x: 1, y: 0.5 };

type SkeletonBlockProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  sweepWidth: number;
  progress: SharedValue<number>;
};

function SkeletonBlock({ x, y, width, height, radius, sweepWidth, progress }: SkeletonBlockProps) {
  const { colors } = useTheme();

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -sweepWidth + progress.get() * sweepWidth * 2 - x }],
  }));

  return (
    <View
      style={[
        styles.block,
        { left: x, top: y, width, height, borderRadius: radius },
        { backgroundColor: colors.skeleton },
      ]}
    >
      <Animated.View style={[styles.sweep, { width: sweepWidth }, sweepStyle]}>
        <LinearGradient
          colors={[colors.skeleton, colors.skeletonHighlight, colors.skeleton]}
          start={GRADIENT_START}
          end={GRADIENT_END}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    position: 'absolute',
    overflow: 'hidden',
  },
  sweep: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
});

export default memo(SkeletonBlock);
