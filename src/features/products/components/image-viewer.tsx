import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { X } from 'lucide-react-native';
import { memo, useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  type ListRenderItem,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useSafeAreaFrame, useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, Text } from '@/components/ui';
import { useTranslation } from '@/i18n';
import { spacing, useScaledSize } from '@/theme';

import { useImageViewerMotion } from '../hooks/use-image-viewer-motion';

type ImageViewerProps = {
  title: string;
  pages: string[];
  initialIndex: number;
  galleryTop: number;
  onIndexChange: (index: number) => void;
  onClosed: () => void;
};

const BACKDROP = '#000000';
const ON_BACKDROP = '#FFFFFF';

function ImageViewer({
  title,
  pages,
  initialIndex,
  galleryTop,
  onIndexChange,
  onClosed,
}: ImageViewerProps) {
  const { t } = useTranslation();
  const { width, height } = useSafeAreaFrame();
  const { top } = useSafeAreaInsets();
  const iconSize = useScaledSize(22);
  const [index, setIndex] = useState(initialIndex);
  const { close, dismissGesture, backdropStyle, chromeStyle, contentStyle } = useImageViewerMotion({
    startOffset: galleryTop - (height - width) / 2,
    screenHeight: height,
    onClosed,
  });

  const onMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(event.nativeEvent.contentOffset.x / width);
      setIndex(next);
      onIndexChange(next);
    },
    [onIndexChange, width],
  );

  const getItemLayout = useCallback(
    (_: ArrayLike<string> | null | undefined, itemIndex: number) => ({
      length: width,
      offset: width * itemIndex,
      index: itemIndex,
    }),
    [width],
  );

  const renderItem: ListRenderItem<string> = useCallback(
    ({ item, index: page }) => (
      <View
        style={{ width, height }}
        accessible
        accessibilityRole="image"
        accessibilityLabel={t('product.imageLabel', {
          title,
          index: page + 1,
          count: pages.length,
        })}
      >
        <Image
          source={item}
          cachePolicy="memory-disk"
          contentFit="contain"
          transition={150}
          style={StyleSheet.absoluteFill}
        />
      </View>
    ),
    [width, height, t, title, pages.length],
  );

  return (
    <View style={StyleSheet.absoluteFill} accessibilityViewIsModal testID="image-viewer">
      <StatusBar style="light" />
      <Animated.View style={[styles.backdrop, backdropStyle]} />
      <GestureDetector gesture={dismissGesture}>
        <Animated.View style={[StyleSheet.absoluteFill, contentStyle]}>
          <FlatList
            data={pages}
            keyExtractor={(item, page) => `${page}-${item}`}
            renderItem={renderItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={initialIndex}
            getItemLayout={getItemLayout}
            onMomentumScrollEnd={onMomentumScrollEnd}
            scrollEnabled={pages.length > 1}
          />
        </Animated.View>
      </GestureDetector>
      <Animated.View
        style={[styles.chrome, { paddingTop: top + spacing.sm }, chromeStyle]}
        pointerEvents="box-none"
      >
        <IconButton
          filled
          accessibilityLabel={t('common.close')}
          onPress={close}
          icon={<X size={iconSize} color={ON_BACKDROP} />}
          style={styles.closeButton}
          testID="image-viewer-close"
        />
        {pages.length > 1 && (
          <Text variant="label" style={styles.counter}>
            {t('product.imageCounter', { index: index + 1, count: pages.length })}
          </Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: BACKDROP,
  },
  chrome: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    borderColor: 'transparent',
  },
  counter: {
    color: ON_BACKDROP,
  },
});

export default memo(ImageViewer);
