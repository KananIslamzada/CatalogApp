import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  type AnimatedStyle,
} from 'react-native-reanimated';

import { useTranslation } from '@/i18n';
import { spacing, useThemedStyles, type Theme } from '@/theme';

import GalleryDots from './gallery-dots';
import { AnimatedImage, productImageTag, productImageTransition } from './shared-image';

type ProductGalleryProps = {
  productId: number;
  title: string;
  thumbnail: string;
  images: string[];
  size: number;
  stretchStyle?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
};

function ProductGallery({
  productId,
  title,
  thumbnail,
  images,
  size,
  stretchStyle,
}: ProductGalleryProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const scrollX = useSharedValue(0);
  const pages = images.length > 0 ? images : [thumbnail];

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.set(event.contentOffset.x);
  });

  return (
    <View style={[styles.container, { height: size }]}>
      <Animated.View style={stretchStyle}>
        <Animated.ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          scrollEnabled={pages.length > 1}
        >
          {pages.map((uri, index) => (
            <View
              key={`${index}-${uri}`}
              style={{ width: size, height: size }}
              accessible
              accessibilityRole="image"
              accessibilityLabel={t('product.imageLabel', {
                title,
                index: index + 1,
                count: pages.length,
              })}
            >
              {index === 0 ? (
                <AnimatedImage
                  sharedTransitionTag={productImageTag(productId)}
                  sharedTransitionStyle={productImageTransition}
                  source={uri}
                  placeholder={thumbnail}
                  placeholderContentFit="cover"
                  cachePolicy="memory-disk"
                  contentFit="cover"
                  transition={200}
                  style={{ width: size, height: size }}
                />
              ) : (
                <Image
                  source={uri}
                  cachePolicy="memory-disk"
                  contentFit="cover"
                  transition={200}
                  style={StyleSheet.absoluteFill}
                />
              )}
            </View>
          ))}
        </Animated.ScrollView>
      </Animated.View>
      {pages.length > 1 && (
        <View style={styles.dots} pointerEvents="none">
          <GalleryDots count={pages.length} pageWidth={size} scrollX={scrollX} />
        </View>
      )}
    </View>
  );
}

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surfaceMuted,
    },
    dots: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: spacing.lg,
      alignItems: 'center',
    },
  });

export default memo(ProductGallery);
