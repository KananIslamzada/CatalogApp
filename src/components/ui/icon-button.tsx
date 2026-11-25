import { GlassView } from 'expo-glass-effect';
import { memo, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { useGlassEnabled } from '@/lib/glass';
import { radius, useTheme, useThemedStyles, type Theme } from '@/theme';

import { usePressFeedback } from './use-press-feedback';

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
  const { scheme } = useTheme();
  const styles = useThemedStyles(createStyles);
  const glassEnabled = useGlassEnabled();
  const isGlass = filled && glassEnabled;
  const { animatedStyle, onPressIn, onPressOut } = usePressFeedback({ disabled: !!disabled });

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      hitSlop={HIT_SLOP}
      disabled={disabled}
      onPressIn={isGlass ? undefined : onPressIn}
      onPressOut={isGlass ? undefined : onPressOut}
      style={[
        styles.base,
        { width: size, height: size },
        filled && !isGlass && styles.filled,
        !isGlass && animatedStyle,
        style,
      ]}
      {...rest}
    >
      {isGlass && (
        <GlassView
          isInteractive={!disabled}
          glassEffectStyle="regular"
          colorScheme={scheme}
          style={[StyleSheet.absoluteFill, { borderRadius: size / 2 }]}
        />
      )}
      <View pointerEvents="none">{icon}</View>
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
