import { memo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { useTranslation } from '@/i18n';
import { spacing, useTheme } from '@/theme';

type ProductListFooterProps = {
  isLoading: boolean;
  hasError: boolean;
  isEnd: boolean;
  onRetry: () => void;
};

function ProductListFooter({ isLoading, hasError, isEnd, onRetry }: ProductListFooterProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {isLoading && (
        <ActivityIndicator color={colors.accent} accessibilityLabel={t('common.loading')} />
      )}
      {!isLoading && hasError && (
        <View style={styles.error}>
          <Text variant="label" tone="muted" align="center">
            {t('catalog.loadMoreFailed')}
          </Text>
          <Button title={t('common.retry')} variant="ghost" onPress={onRetry} />
        </View>
      )}
      {!isLoading && !hasError && isEnd && (
        <Text variant="caption" tone="muted" align="center">
          {t('catalog.endOfList')}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 72,
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  error: {
    alignItems: 'center',
  },
});

export default memo(ProductListFooter);
