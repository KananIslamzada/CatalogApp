import { Image } from 'expo-image';
import { memo, useCallback, useEffect, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  type AnimatedStyle,
} from 'react-native-reanimated';

import { useTranslation } from '@/i18n';
import { spacing, useThemedStyles, type Theme } from '@/theme';

import GalleryDots from './gallery-dots';
import {
  AnimatedImage,
  productImageTag,
  productImageTransition,
  type ProductSource,
} from './shared-image';

type ProductGalleryProps = {
  productId: number;
  source: ProductSource | null;
  title: string;
  thumbnail: string;
  pages: string[];
  size: number;
  index: number;
  onIndexChange: (index: number) => void;
  onOpen: (index: number) => void;
  stretchStyle?: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
};

function ProductGallery({
  productId,
  source,
  title,
  thumbnail,
  pages,
  size,
  index,
  onIndexChange,
  onOpen,
  stretchStyle,
}: ProductGalleryProps) {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const scrollX = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.set(event.contentOffset.x);
  });

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (size > 0) onIndexChange(Math.round(event.nativeEvent.contentOffset.x / size));
    },
    [onIndexChange, size],
  );

  useEffect(() => {
    const offset = index * size;
    if (Math.round(scrollX.get()) !== Math.round(offset)) {
      scrollRef.current?.scrollTo({ x: offset, animated: false });
    }
  }, [index, size, scrollX]);

  return (
    <View style={[styles.container, { height: size }]}>
      <Animated.View style={stretchStyle}>
        <Animated.ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          onMomentumScrollEnd={onMomentumScrollEnd}
          scrollEventThrottle={16}
          scrollEnabled={pages.length > 1}
        >
          {pages.map((uri, page) => (
            <Pressable
              key={`${page}-${uri}`}
              onPress={() => onOpen(page)}
              style={{ width: size, height: size }}
              accessibilityRole="imagebutton"
              accessibilityLabel={t('product.imageLabel', {
                title,
                index: page + 1,
                count: pages.length,
              })}
              accessibilityHint={t('product.openImageHint')}
              testID={`gallery-image-${page}`}
            >
              {page === 0 ? (
                <AnimatedImage
                  sharedTransitionTag={
                    source && index === 0 ? productImageTag(source, productId) : undefined
                  }
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
            </Pressable>
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
