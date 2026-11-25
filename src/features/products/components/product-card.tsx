import { memo, useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type AccessibilityActionEvent,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { Text, usePressFeedback } from '@/components/ui';
import { useTranslation } from '@/i18n';
import { MAX_FONT_SCALE, radius, spacing, typography, useThemedStyles, type Theme } from '@/theme';

import { discountPercent, formatPrice, formatRating } from '../format';
import { useFavouriteToggle } from '../hooks/use-favourites';
import { type Product } from '../types';
import FavouriteButton from './favourite-button';
import ProductRating from './product-rating';
import { AnimatedImage, productImageTag, productImageTransition } from './shared-image';

type ProductCardProps = {
  product: Product;
  onPress: (id: number) => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TITLE_LINES = 2;
const FAVOURITE_ACTION = 'toggleFavourite';
const FAVOURITE_SIZE = 34;

function ProductCard({ product, onPress }: ProductCardProps) {
  const { t, locale } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const { animatedStyle, onPressIn, onPressOut } = usePressFeedback();
  const price = formatPrice(product.price, locale);
  const discount = discountPercent(product.discountPercentage);
  const { fontScale } = useWindowDimensions();
  const titleMinHeight =
    (typography.label.lineHeight ?? 0) * TITLE_LINES * Math.min(fontScale, MAX_FONT_SCALE);

  const { isFavourite, toggle } = useFavouriteToggle(product);

  const handlePress = useCallback(() => onPress(product.id), [onPress, product.id]);

  const onAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      if (event.nativeEvent.actionName === FAVOURITE_ACTION) toggle();
    },
    [toggle],
  );

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={t('product.cardLabel', {
        title: product.title,
        price,
        rating: formatRating(product.rating),
      })}
      accessibilityActions={[
        {
          name: FAVOURITE_ACTION,
          label: t(isFavourite ? 'favourites.remove' : 'favourites.add'),
        },
      ]}
      onAccessibilityAction={onAccessibilityAction}
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.card, animatedStyle]}
      testID={`product-card-${product.id}`}
    >
      <View style={styles.media}>
        <AnimatedImage
          sharedTransitionTag={productImageTag(product.id)}
          sharedTransitionStyle={productImageTransition}
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
        <View style={styles.favourite}>
          <FavouriteButton
            isFavourite={isFavourite}
            onToggle={toggle}
            size={FAVOURITE_SIZE}
            iconSize={17}
            testID={`favourite-${product.id}`}
          />
        </View>
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
      width: '100%',
      height: '100%',
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
    favourite: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
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
