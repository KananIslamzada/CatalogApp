import { Star } from 'lucide-react-native';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { useTranslation, type TranslationKey } from '@/i18n';
import { radius, spacing, useScaledSize, useTheme, useThemedStyles, type Theme } from '@/theme';

import {
  discountPercent,
  formatPrice,
  formatRating,
  originalPrice,
  stockLevel,
  type StockLevel,
} from '../format';
import { type Product } from '../types';

const stockLabel: Record<StockLevel, TranslationKey> = {
  in: 'product.inStock',
  low: 'product.lowStock',
  out: 'product.outOfStock',
};

const stockTone = { in: 'success', low: 'danger', out: 'muted' } as const;

function ProductInfo({ product }: { product: Product }) {
  const { t, locale } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const starSize = useScaledSize(16);
  const discount = discountPercent(product.discountPercentage);
  const wasPrice = originalPrice(product.price, product.discountPercentage);
  const level = stockLevel(product.stock);
  const rating = formatRating(product.rating);
  const subtitle = product.brand ? `${product.brand} · ${product.category}` : product.category;

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text variant="caption" tone="muted" style={styles.subtitle}>
          {subtitle}
        </Text>
        <Text variant="title" accessibilityRole="header" testID="product-title">
          {product.title}
        </Text>
      </View>

      <View style={styles.priceRow}>
        <Text variant="title" tone="accent">
          {formatPrice(product.price, locale)}
        </Text>
        {wasPrice !== null && (
          <Text
            tone="muted"
            style={styles.wasPrice}
            accessibilityLabel={t('product.originalPrice', {
              price: formatPrice(wasPrice, locale),
            })}
          >
            {formatPrice(wasPrice, locale)}
          </Text>
        )}
        {discount !== null && (
          <View style={styles.badge}>
            <Text variant="caption" tone="danger" style={styles.badgeText}>
              {t('product.discount', { percent: discount })}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.metaRow}>
        <View
          style={styles.rating}
          accessible
          accessibilityLabel={t('product.ratingLabel', { rating })}
        >
          <Star size={starSize} color={colors.rating} fill={colors.rating} />
          <Text variant="label">{rating}</Text>
        </View>
        <Text variant="label" tone="muted">
          ·
        </Text>
        <Text variant="label" tone={stockTone[level]}>
          {t(stockLabel[level], { count: product.stock })}
        </Text>
      </View>

      <View style={styles.section}>
        <Text variant="heading" accessibilityRole="header">
          {t('product.about')}
        </Text>
        <Text tone="secondary">{product.description}</Text>
      </View>
    </View>
  );
}

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    container: {
      gap: spacing.lg,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
    },
    heading: {
      gap: spacing.xs,
    },
    subtitle: {
      textTransform: 'capitalize',
    },
    priceRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      columnGap: spacing.sm,
      rowGap: spacing.xs,
    },
    wasPrice: {
      textDecorationLine: 'line-through',
    },
    badge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
      borderRadius: radius.pill,
      backgroundColor: colors.dangerSoft,
    },
    badgeText: {
      fontWeight: '600',
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: spacing.sm,
    },
    rating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    section: {
      gap: spacing.sm,
      paddingTop: spacing.lg,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
  });

export default memo(ProductInfo);
