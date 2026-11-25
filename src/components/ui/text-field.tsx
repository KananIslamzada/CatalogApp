import { Eye, EyeOff } from 'lucide-react-native';
import { memo, useCallback, useState, type ComponentRef, type ReactNode, type Ref } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type StyleProp,
  type TargetedEvent,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTranslation } from '@/i18n';
import {
  MAX_FONT_SCALE,
  radius,
  spacing,
  typography,
  useTheme,
  useThemedStyles,
  type Theme,
} from '@/theme';

import Text from './text';

export type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string;
  leftIcon?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  ref?: Ref<ComponentRef<typeof TextInput>>;
};

type FocusEvent = NativeSyntheticEvent<TargetedEvent>;

const FOCUS_DURATION = 160;

function TextField({
  label,
  error,
  leftIcon,
  containerStyle,
  secureTextEntry,
  onFocus,
  onBlur,
  ref,
  ...rest
}: TextFieldProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const [isSecretVisible, setSecretVisible] = useState(false);
  const focus = useSharedValue(0);
  const hasError = !!error;

  const fieldStyle = useAnimatedStyle(
    () => ({
      borderColor: hasError
        ? colors.danger
        : interpolateColor(focus.get(), [0, 1], [colors.border, colors.accent]),
    }),
    [colors, focus, hasError],
  );

  const handleFocus = useCallback(
    (event: FocusEvent) => {
      focus.set(withTiming(1, { duration: FOCUS_DURATION }));
      onFocus?.(event);
    },
    [focus, onFocus],
  );

  const handleBlur = useCallback(
    (event: FocusEvent) => {
      focus.set(withTiming(0, { duration: FOCUS_DURATION }));
      onBlur?.(event);
    },
    [focus, onBlur],
  );

  const toggleSecret = useCallback(() => setSecretVisible((visible) => !visible), []);

  const SecretIcon = isSecretVisible ? EyeOff : Eye;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Text variant="label" tone="secondary">
        {label}
      </Text>
      <Animated.View style={[styles.field, fieldStyle]}>
        {leftIcon}
        <TextInput
          ref={ref}
          accessibilityLabel={label}
          accessibilityHint={error}
          aria-invalid={hasError}
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          cursorColor={colors.accent}
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          secureTextEntry={secureTextEntry && !isSecretVisible}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={styles.input}
          {...rest}
        />
        {secureTextEntry && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isSecretVisible ? t('common.hidePassword') : t('common.showPassword')
            }
            hitSlop={spacing.md}
            onPress={toggleSecret}
          >
            <SecretIcon size={20} color={colors.textMuted} />
          </Pressable>
        )}
      </Animated.View>
      {hasError && (
        <Text
          variant="caption"
          tone="danger"
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
        >
          {error}
        </Text>
      )}
    </View>
  );
}

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    wrapper: {
      gap: spacing.xs + spacing.xxs,
    },
    field: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
      borderWidth: 1.5,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
    },
    input: {
      ...typography.body,
      flex: 1,
      paddingVertical: spacing.md,
      color: colors.textPrimary,
    },
  });

export default memo(TextField);
