import { memo, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { spacing, useTheme } from '@/theme';

import Button from './button';
import Text from './text';

type StateViewProps = {
  title?: string;
  message?: string;
  icon?: ReactNode;
  loading?: boolean;
  actionLabel?: string;
  onAction?: () => void;
};

function StateView({ title, message, icon, loading, actionLabel, onAction }: StateViewProps) {
  const { colors } = useTheme();

  return (
    <Animated.View entering={FadeIn.duration(220)} style={styles.container}>
      {loading ? <ActivityIndicator size="large" color={colors.accent} /> : icon}
      <View style={styles.copy}>
        {!!title && (
          <Text variant="heading" align="center" accessibilityRole="header">
            {title}
          </Text>
        )}
        {!!message && (
          <Text tone="muted" align="center">
            {message}
          </Text>
        )}
      </View>
      {!!actionLabel && !!onAction && (
        <Button title={actionLabel} variant="secondary" onPress={onAction} style={styles.action} />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  copy: {
    gap: spacing.xs,
    maxWidth: 320,
  },
  action: {
    alignSelf: 'center',
    minWidth: 160,
  },
});

export default memo(StateView);
