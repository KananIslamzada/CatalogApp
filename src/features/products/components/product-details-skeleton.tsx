import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTranslation } from '@/i18n';
import { radius, spacing, useThemedStyles, type Theme } from '@/theme';

function ProductDetailsSkeleton({ size }: { size: number }) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);

  return (
    <View accessible accessibilityLabel={t('product.loading')} testID="product-skeleton">
      <View style={[styles.block, { height: size }]} />
      <View style={styles.body}>
        <View style={[styles.line, styles.caption]} />
        <View style={[styles.line, styles.title]} />
        <View style={[styles.line, styles.price]} />
        <View style={[styles.line, styles.text]} />
        <View style={[styles.line, styles.text]} />
        <View style={[styles.line, styles.textShort]} />
      </View>
    </View>
  );
}

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    block: {
      backgroundColor: colors.skeleton,
    },
    body: {
      gap: spacing.md,
      padding: spacing.lg,
      paddingTop: spacing.xl,
    },
    line: {
      height: 14,
      borderRadius: radius.sm,
      backgroundColor: colors.skeleton,
    },
    caption: { width: '30%', height: 12 },
    title: { width: '75%', height: 26 },
    price: { width: '35%', height: 26, marginBottom: spacing.md },
    text: { width: '100%' },
    textShort: { width: '60%' },
  });

export default memo(ProductDetailsSkeleton);
