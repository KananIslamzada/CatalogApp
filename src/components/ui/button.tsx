import { memo, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { radius, spacing, useTheme, useThemedStyles, type Theme } from '@/theme';

import Text from './text';
import { usePressScale } from './use-press-scale';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export type ButtonProps = Omit<
  PressableProps,
  'style' | 'children' | 'onPressIn' | 'onPressOut'
> & {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  icon,
  style,
  accessibilityLabel,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const { animatedStyle, onPressIn, onPressOut } = usePressScale();
  const isDisabled = disabled || loading;
  const contentTone = variant === 'primary' ? 'inverse' : 'accent';
  const contentColor = variant === 'primary' ? colors.textInverse : colors.accent;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.base, styles[variant], isDisabled && styles.disabled, animatedStyle, style]}
      {...rest}
    >
      <View style={styles.content}>
        {loading ? <ActivityIndicator color={contentColor} /> : icon}
        <Text variant="bodyStrong" tone={contentTone} numberOfLines={2} align="center">
          {title}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    base: {
      minHeight: 52,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: radius.lg,
      justifyContent: 'center',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    primary: {
      backgroundColor: colors.accent,
    },
    secondary: {
      backgroundColor: colors.accentSoft,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    disabled: {
      opacity: 0.5,
    },
  });

export default memo(Button);
