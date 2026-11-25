import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { radius, spacing, useThemedStyles, type Theme } from '@/theme';

type GalleryDotsProps = {
  count: number;
  pageWidth: number;
  scrollX: SharedValue<number>;
};

function Dot({ index, pageWidth, scrollX }: Omit<GalleryDotsProps, 'count'> & { index: number }) {
  const styles = useThemedStyles(createStyles);

  const animatedStyle = useAnimatedStyle(() => {
    const position = pageWidth > 0 ? scrollX.get() / pageWidth : 0;
    const range = [index - 1, index, index + 1];
    return {
      opacity: interpolate(position, range, [0.4, 1, 0.4], Extrapolation.CLAMP),
      transform: [{ scale: interpolate(position, range, [1, 1.3, 1], Extrapolation.CLAMP) }],
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

function GalleryDots({ count, pageWidth, scrollX }: GalleryDotsProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.pill} pointerEvents="none" importantForAccessibility="no-hide-descendants">
      {Array.from({ length: count }, (_, index) => (
        <Dot key={index} index={index} pageWidth={pageWidth} scrollX={scrollX} />
      ))}
    </View>
  );
}

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: colors.overlay,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.textInverse,
    },
  });

export default memo(GalleryDots);
