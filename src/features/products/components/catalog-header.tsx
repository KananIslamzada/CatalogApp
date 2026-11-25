import { LogOut } from 'lucide-react-native';
import { memo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { IconButton, Text } from '@/components/ui';
import { useConfirmSignOut, useSessionStore } from '@/features/auth';
import { useTranslation } from '@/i18n';
import { spacing, useScaledSize, useTheme } from '@/theme';

import { GRID_PADDING } from './layout';

function CatalogHeader() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const iconSize = useScaledSize(20);
  const firstName = useSessionStore((state) => state.user?.firstName ?? '');
  const { confirmSignOut, isSigningOut } = useConfirmSignOut();

  return (
    <View style={styles.container}>
      <View style={styles.titles}>
        <Text variant="display" accessibilityRole="header" numberOfLines={1}>
          {t('catalog.title')}
        </Text>
        {!!firstName && (
          <Text tone="muted" numberOfLines={1}>
            {t('home.greeting', { name: firstName })}
          </Text>
        )}
      </View>
      <IconButton
        filled
        accessibilityLabel={t('auth.signOut')}
        disabled={isSigningOut}
        onPress={confirmSignOut}
        icon={
          isSigningOut ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <LogOut size={iconSize} color={colors.textPrimary} />
          )
        }
        testID="sign-out"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: GRID_PADDING,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  titles: {
    flex: 1,
    gap: spacing.xxs,
  },
});

export default memo(CatalogHeader);
