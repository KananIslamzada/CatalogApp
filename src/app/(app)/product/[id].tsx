import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, SearchX } from 'lucide-react-native';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { IconButton, Screen, StateView, Text } from '@/components/ui';
import { parseProductId } from '@/features/deep-links';
import { useTranslation } from '@/i18n';
import { spacing, useScaledSize, useTheme } from '@/theme';

export default function ProductScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const iconSize = useScaledSize(24);
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = parseProductId(id);

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, []);

  return (
    <Screen>
      <View style={styles.toolbar}>
        <IconButton
          filled
          accessibilityLabel={t('common.back')}
          onPress={goBack}
          icon={<ChevronLeft size={iconSize} color={colors.textPrimary} />}
        />
      </View>
      {productId === null ? (
        <StateView
          icon={<SearchX size={48} color={colors.textMuted} />}
          title={t('product.notFound')}
          message={t('product.notFoundMessage')}
        />
      ) : (
        <View style={styles.content}>
          <Text variant="title" accessibilityRole="header" testID="product-title">
            {t('product.title', { id: productId })}
          </Text>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
});
