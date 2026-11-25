import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { type BaseToastProps } from 'react-native-toast-message';

import { radius, spacing, useTheme, useThemedStyles, type Palette, type Theme } from '@/theme';

import Text from '../text';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

const ACCENT: Record<ToastType, keyof Palette> = {
  success: 'success',
  info: 'accent',
  warning: 'rating',
  error: 'danger',
};

type AppToastProps = BaseToastProps & {
  type: ToastType;
};

function AppToast({ text1, text2, type, onPress }: AppToastProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={styles.container}
    >
      <View style={[styles.accent, { backgroundColor: colors[ACCENT[type]] }]} />
      <View style={styles.content}>
        {!!text1 && (
          <Text variant="label" numberOfLines={2}>
            {text1}
          </Text>
        )}
        {!!text2 && (
          <Text variant="caption" tone="muted" numberOfLines={3}>
            {text2}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    container: {
      width: '90%',
      maxWidth: 480,
      minHeight: 58,
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
      borderRadius: radius.md,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      shadowColor: '#000000',
      shadowOpacity: 0.12,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
    accent: {
      width: 4,
      alignSelf: 'stretch',
    },
    content: {
      flex: 1,
      gap: spacing.xxs,
      paddingHorizontal: spacing.md + spacing.xxs,
      paddingVertical: spacing.sm + spacing.xxs,
    },
  });

export default memo(AppToast);
