import { memo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fadeIn, spacing } from '@/theme';

import { useProductDetailScroll } from '../hooks/use-product-detail-scroll';
import { useProductDetails } from '../hooks/use-product-details';
import ImageViewer from './image-viewer';
import { TOP_BAR_HEIGHT } from './layout';
import ProductFavouriteButton from './product-favourite-button';
import ProductGallery from './product-gallery';
import ProductInfo from './product-info';
import ProductLoadState from './product-load-state';
import ProductTopBar from './product-top-bar';
import { type ProductSource } from './shared-image';

type ProductDetailsProps = {
  id: number;
  source: ProductSource | null;
};

function ProductDetails({ id, source }: ProductDetailsProps) {
  const { width } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  const { scrollY, onScroll, galleryStyle, backdropStyle, titleStyle } = useProductDetailScroll(
    width,
    top + TOP_BAR_HEIGHT,
  );
  const {
    product,
    error,
    retry,
    revealOnLoad,
    pages,
    galleryIndex,
    setGalleryIndex,
    viewer,
    openViewer,
    closeViewer,
  } = useProductDetails(id, scrollY);

  if (!product) return <ProductLoadState error={error} size={width} onRetry={retry} />;

  return (
    <>
      <View
        style={styles.root}
        importantForAccessibility={viewer ? 'no-hide-descendants' : 'auto'}
        accessibilityElementsHidden={!!viewer}
      >
        <Animated.ScrollView
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: bottom + spacing.xl }}
        >
          <Animated.View entering={revealOnLoad ? fadeIn : undefined}>
            <ProductGallery
              productId={product.id}
              source={source}
              title={product.title}
              thumbnail={product.thumbnail}
              pages={pages}
              size={width}
              index={galleryIndex}
              onIndexChange={setGalleryIndex}
              onOpen={openViewer}
              stretchStyle={galleryStyle}
            />
            <ProductInfo product={product} />
          </Animated.View>
        </Animated.ScrollView>
        <ProductTopBar
          title={product.title}
          backdropStyle={backdropStyle}
          titleStyle={titleStyle}
          accessory={<ProductFavouriteButton product={product} />}
        />
      </View>
      {viewer && (
        <ImageViewer
          title={product.title}
          pages={pages}
          initialIndex={viewer.index}
          galleryTop={viewer.galleryTop}
          onIndexChange={setGalleryIndex}
          onClosed={closeViewer}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default memo(ProductDetails);
