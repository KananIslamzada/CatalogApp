import { ShoppingBag } from 'lucide-react-native';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Text } from '@/components/ui';
import { useTranslation } from '@/i18n';
import { layoutTransition, radius, spacing, useTheme } from '@/theme';

function LoginHeader() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.duration(420)}
      layout={layoutTransition}
      style={styles.container}
    >
      <View style={[styles.badge, { backgroundColor: colors.accentSoft }]}>
        <ShoppingBag size={28} color={colors.accent} />
      </View>
      <Text variant="display" accessibilityRole="header">
        {t('auth.title')}
      </Text>
      <Text tone="muted">{t('auth.subtitle')}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
});

export default memo(LoginHeader);
