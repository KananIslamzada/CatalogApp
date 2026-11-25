import { CloudOff, SearchX } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StateView } from '@/components/ui';
import { useTranslation } from '@/i18n';
import { errorMessageKey, isApiError } from '@/lib/api';
import { fadeIn, spacing, useTheme } from '@/theme';

import { useProductDetailScroll } from '../hooks/use-product-detail-scroll';
import { useProductQuery } from '../hooks/use-product-query';
import ImageViewer from './image-viewer';
import { TOP_BAR_HEIGHT } from './layout';
import ProductDetailsSkeleton from './product-details-skeleton';
import ProductFavouriteButton from './product-favourite-button';
import ProductGallery from './product-gallery';
import ProductInfo from './product-info';
import ProductTopBar from './product-top-bar';
import { type ProductSource } from './shared-image';

function isNotFound(error: unknown) {
  return isApiError(error) && error.kind === 'http' && error.status === 404;
}

function ProductNotFound() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  return (
    <StateView
      icon={<SearchX size={48} color={colors.textMuted} />}
      title={t('product.notFound')}
      message={t('product.notFoundMessage')}
    />
  );
}

function ProductDetails({ id, source }: { id: number; source: ProductSource | null }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  const { data, error, isError, refetch } = useProductQuery(id);
  const [revealOnLoad] = useState(() => data === undefined);
  const { scrollY, onScroll, galleryStyle, backdropStyle, titleStyle } = useProductDetailScroll(
    width,
    top + TOP_BAR_HEIGHT,
  );
  const product = data?.product;
  const pages = useMemo(() => {
    if (!product) return [];
    return product.images.length > 0 ? product.images : [product.thumbnail];
  }, [product]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [viewer, setViewer] = useState<{ index: number; galleryTop: number } | null>(null);

  const openViewer = useCallback(
    (index: number) => setViewer({ index, galleryTop: -Math.max(0, scrollY.get()) }),
    [scrollY],
  );
  const closeViewer = useCallback(() => setViewer(null), []);

  if (!product) {
    return (
      <>
        {!isError ? (
          <ProductDetailsSkeleton size={width} />
        ) : isNotFound(error) ? (
          <ProductNotFound />
        ) : (
          <StateView
            icon={<CloudOff size={48} color={colors.textMuted} />}
            title={t('product.errorTitle')}
            message={t(errorMessageKey(error))}
            actionLabel={t('common.retry')}
            onAction={refetch}
          />
        )}
        <ProductTopBar />
      </>
    );
  }

  return (
    <>
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

type ProductDetailsScreenProps = {
  id: number | null;
  source?: ProductSource | null;
};

export default function ProductDetailsScreen({ id, source = null }: ProductDetailsScreenProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {id === null ? (
        <>
          <ProductNotFound />
          <ProductTopBar />
        </>
      ) : (
        <ProductDetails id={id} source={source} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
