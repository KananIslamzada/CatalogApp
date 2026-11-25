import { GlassView } from 'expo-glass-effect';
import { memo, useMemo, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { useStableBusy } from '@/hooks/use-stable-busy';
import { useGlassEnabled } from '@/lib/glass';
import { fadeIn, fadeOut, layoutTransition, radius, spacing, useTheme, type Theme } from '@/theme';

import Text from './text';
import { useBusyTint } from './use-busy-tint';
import { usePressFeedback } from './use-press-feedback';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export type ButtonProps = Omit<
  PressableProps,
  'style' | 'children' | 'onPressIn' | 'onPressOut'
> & {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: ReactNode;
  glass?: boolean;
  style?: StyleProp<ViewStyle>;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPINNER_TIMING = { delayMs: 0, minVisibleMs: 300 };
const TINT_TIMING = { delayMs: 150, minVisibleMs: 450 };

function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  icon,
  glass = true,
  style,
  accessibilityLabel,
  ...rest
}: ButtonProps) {
  const { colors, scheme } = useTheme();
  const showSpinner = useStableBusy(loading, SPINNER_TIMING);
  const showBusyTint = useStableBusy(loading, TINT_TIMING);
  const isDisabled = !!disabled || loading || showSpinner;
  const glassEnabled = useGlassEnabled();
  const isGlass = glass && glassEnabled && variant !== 'ghost';
  const { animatedStyle, onPressIn, onPressOut } = usePressFeedback({
    disabled: isDisabled,
    dimmed: !!disabled,
  });
  const glassRadius = useMemo(() => StyleSheet.flatten(style)?.borderRadius ?? radius.lg, [style]);
  const contentTone = variant === 'primary' ? 'inverse' : 'accent';
  const { idle, busy } = backgroundColors(variant, colors);
  const { backgroundStyle, labelStyle } = useBusyTint(showBusyTint, idle, busy);

  return (
    <AnimatedPressable
      renderToHardwareTextureAndroid={!isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: isDisabled, busy: loading || showSpinner }}
      disabled={isDisabled}
      onPressIn={isGlass ? undefined : onPressIn}
      onPressOut={isGlass ? undefined : onPressOut}
      style={[
        styles.base,
        isGlass ? styles.transparent : backgroundStyle,
        isGlass ? !!disabled && styles.dimmed : animatedStyle,
        style,
      ]}
      {...rest}
    >
      {isGlass && (
        <GlassView
          isInteractive={!isDisabled}
          glassEffectStyle="regular"
          tintColor={showBusyTint ? busy : idle}
          colorScheme={scheme}
          style={[StyleSheet.absoluteFill, { borderRadius: glassRadius }]}
        />
      )}
      <Animated.View layout={layoutTransition} pointerEvents="none" style={styles.content}>
        {showSpinner ? (
          <Animated.View key="spinner" entering={fadeIn} exiting={fadeOut}>
            <ActivityIndicator color={colors.accent} />
          </Animated.View>
        ) : (
          !!icon && (
            <Animated.View key="icon" entering={fadeIn} exiting={fadeOut}>
              {icon}
            </Animated.View>
          )
        )}
        <Animated.View layout={layoutTransition} style={[styles.label, labelStyle]}>
          <Text variant="bodyStrong" tone={contentTone} numberOfLines={2} align="center">
            {title}
          </Text>
        </Animated.View>
      </Animated.View>
    </AnimatedPressable>
  );
}

function backgroundColors(variant: ButtonVariant, colors: Theme['colors']) {
  switch (variant) {
    case 'primary':
      return { idle: colors.accent, busy: colors.accentMuted };
    case 'secondary':
      return { idle: colors.accentSoft, busy: colors.surfaceMuted };
    case 'ghost':
      return { idle: 'transparent', busy: 'transparent' };
  }
}

const styles = StyleSheet.create({
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
  label: {
    flexShrink: 1,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  dimmed: {
    opacity: 0.5,
  },
});

export default memo(Button);
