import { memo, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { radius, useThemedStyles, type Theme } from '@/theme';

import { usePressScale } from './use-press-scale';

export type IconButtonProps = Omit<
  PressableProps,
  'style' | 'children' | 'onPressIn' | 'onPressOut'
> & {
  icon: ReactNode;
  accessibilityLabel: string;
  size?: number;
  filled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const HIT_SLOP = 8;

function IconButton({
  icon,
  size = 44,
  filled = false,
  style,
  disabled,
  ...rest
}: IconButtonProps) {
  const styles = useThemedStyles(createStyles);
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.88);

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      hitSlop={HIT_SLOP}
      disabled={disabled}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[
        styles.base,
        { width: size, height: size },
        filled && styles.filled,
        animatedStyle,
        style,
      ]}
      {...rest}
    >
      {icon}
    </AnimatedPressable>
  );
}

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    base: {
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filled: {
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
  });

export default memo(IconButton);
