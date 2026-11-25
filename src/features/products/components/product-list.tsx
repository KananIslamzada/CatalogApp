import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { CircleAlert, PackageOpen } from 'lucide-react-native';
import { memo, useCallback } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StateView } from '@/components/ui';
import { useTranslation } from '@/i18n';
import { errorMessageKey } from '@/lib/api';
import { spacing, useTheme } from '@/theme';

import { useProductList } from '../hooks/use-product-list';
import { type Product } from '../types';
import { GRID_COLUMNS, GRID_GAP, GRID_PADDING } from './layout';
import ProductCard from './product-card';
import ProductListFooter from './product-list-footer';
import ProductListSkeleton from './product-list-skeleton';

const keyExtractor = (product: Product) => String(product.id);

function ProductList() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const {
    products,
    status,
    error,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    isRefreshing,
    onRefresh,
    onEndReached,
    retryNextPage,
    openProduct,
  } = useProductList();

  const renderItem: ListRenderItem<Product> = useCallback(
    ({ item, index }) => (
      <View style={index % GRID_COLUMNS === 0 ? styles.leftCell : styles.rightCell}>
        <ProductCard product={item} onPress={openProduct} />
      </View>
    ),
    [openProduct],
  );

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  if (status === 'pending') return <ProductListSkeleton />;

  if (status === 'error' && products.length === 0) {
    return (
      <StateView
        icon={<CircleAlert size={44} color={colors.textMuted} />}
        title={t('catalog.errorTitle')}
        message={t(errorMessageKey(error))}
        actionLabel={t('common.retry')}
        onAction={handleRetry}
      />
    );
  }

  return (
    <FlashList
      data={products}
      numColumns={GRID_COLUMNS}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.6}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ ...styles.content, paddingBottom: bottom + spacing.xl }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
          progressBackgroundColor={colors.surface}
        />
      }
      ListEmptyComponent={
        <StateView
          icon={<PackageOpen size={44} color={colors.textMuted} />}
          title={t('catalog.emptyTitle')}
          message={t('catalog.emptyMessage')}
        />
      }
      ListFooterComponent={
        products.length > 0 ? (
          <ProductListFooter
            isLoading={isFetchingNextPage}
            hasError={isFetchNextPageError}
            isEnd={!hasNextPage}
            onRetry={retryNextPage}
          />
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: GRID_PADDING,
  },
  leftCell: {
    flex: 1,
    paddingRight: GRID_GAP / 2,
    paddingBottom: GRID_GAP,
  },
  rightCell: {
    flex: 1,
    paddingLeft: GRID_GAP / 2,
    paddingBottom: GRID_GAP,
  },
});

export default memo(ProductList);
