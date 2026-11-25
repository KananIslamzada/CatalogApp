import { Image } from 'expo-image';
import { memo, useCallback } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Text, usePressFeedback } from '@/components/ui';
import { useTranslation } from '@/i18n';
import { MAX_FONT_SCALE, radius, spacing, typography, useThemedStyles, type Theme } from '@/theme';

import { discountPercent, formatPrice, formatRating } from '../format';
import { type Product } from '../types';
import ProductRating from './product-rating';

type ProductCardProps = {
  product: Product;
  onPress: (id: number) => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TITLE_LINES = 2;

function ProductCard({ product, onPress }: ProductCardProps) {
  const { t, locale } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const { animatedStyle, onPressIn, onPressOut } = usePressFeedback();
  const price = formatPrice(product.price, locale);
  const discount = discountPercent(product.discountPercentage);
  const { fontScale } = useWindowDimensions();
  const titleMinHeight =
    (typography.label.lineHeight ?? 0) * TITLE_LINES * Math.min(fontScale, MAX_FONT_SCALE);

  const handlePress = useCallback(() => onPress(product.id), [onPress, product.id]);

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={t('product.cardLabel', {
        title: product.title,
        price,
        rating: formatRating(product.rating),
      })}
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.card, animatedStyle]}
      testID={`product-card-${product.id}`}
    >
      <View style={styles.media}>
        <Image
          source={product.thumbnail}
          recyclingKey={String(product.id)}
          cachePolicy="memory-disk"
          contentFit="cover"
          transition={150}
          style={styles.image}
          accessible={false}
        />
        {discount !== null && (
          <View style={styles.badge}>
            <Text variant="caption" tone="inverse">
              {t('product.discount', { percent: discount })}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text variant="label" numberOfLines={TITLE_LINES} style={{ minHeight: titleMinHeight }}>
          {product.title}
        </Text>
        <Text variant="caption" tone="muted" numberOfLines={1}>
          {product.brand ?? product.category}
        </Text>
        <View style={styles.footer}>
          <Text variant="bodyStrong" numberOfLines={1} style={styles.price}>
            {price}
          </Text>
          <ProductRating rating={product.rating} />
        </View>
      </View>
    </AnimatedPressable>
  );
}

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    card: {
      overflow: 'hidden',
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
    },
    media: {
      aspectRatio: 1,
      backgroundColor: colors.surfaceMuted,
    },
    image: {
      ...StyleSheet.absoluteFill,
    },
    badge: {
      position: 'absolute',
      top: spacing.sm,
      left: spacing.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
      borderRadius: radius.pill,
      backgroundColor: colors.danger,
    },
    info: {
      gap: spacing.xs,
      padding: spacing.md,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
      marginTop: spacing.xxs,
    },
    price: {
      flexShrink: 1,
    },
  });

export default memo(ProductCard);
