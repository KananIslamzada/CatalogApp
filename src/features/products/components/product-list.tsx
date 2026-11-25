import { FlashList, type FlashListRef, type ListRenderItem } from '@shopify/flash-list';
import { CircleAlert, PackageOpen, SearchX } from 'lucide-react-native';
import { memo, useCallback, type ReactElement, type Ref } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import Animated, { type ScrollHandlerProcessed } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StateView } from '@/components/ui';
import { useTranslation } from '@/i18n';
import { errorMessageKey } from '@/lib/api';
import { spacing, useTheme } from '@/theme';

import { useProductList } from '../hooks/use-product-list';
import { type Product } from '../types';
import { GRID_COLUMNS, GRID_GAP, GRID_PADDING, TOP_BAR_HEIGHT } from './layout';
import ProductCard from './product-card';
import ProductListFooter from './product-list-footer';
import ProductListSkeleton from './product-list-skeleton';
import { useStaleFade } from './use-stale-fade';

const AnimatedFlashList = Animated.createAnimatedComponent(FlashList<Product>);

const keyExtractor = (product: Product) => String(product.id);

const NO_POSITION_ANCHORING = { disabled: true };

type ProductListProps = {
  term: string;
  header: ReactElement;
  onScroll: ScrollHandlerProcessed<Record<string, unknown>>;
  listRef?: Ref<FlashListRef<Product>>;
};

function ProductList({ term, header, onScroll, listRef }: ProductListProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { top, bottom } = useSafeAreaInsets();
  const topInset = top + TOP_BAR_HEIGHT;
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
    isSearching,
    isStale,
  } = useProductList(term);
  const staleStyle = useStaleFade(isStale);

  const renderItem: ListRenderItem<Product> = useCallback(
    ({ item, index }) => (
      <Animated.View
        style={[index % GRID_COLUMNS === 0 ? styles.leftCell : styles.rightCell, staleStyle]}
      >
        <ProductCard product={item} source="catalog" onPress={openProduct} />
      </Animated.View>
    ),
    [openProduct, staleStyle],
  );

  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  const renderEmpty = () => {
    if (status === 'pending') return <ProductListSkeleton />;
    if (status === 'error') {
      return (
        <StateView
          icon={<CircleAlert size={44} color={colors.textMuted} />}
          title={t(isSearching ? 'search.errorTitle' : 'catalog.errorTitle')}
          message={t(errorMessageKey(error))}
          actionLabel={t('common.retry')}
          onAction={handleRetry}
        />
      );
    }
    if (isSearching) {
      return (
        <StateView
          icon={<SearchX size={44} color={colors.textMuted} />}
          title={t('search.emptyTitle')}
          message={t('search.emptyMessage', { term })}
        />
      );
    }
    return (
      <StateView
        icon={<PackageOpen size={44} color={colors.textMuted} />}
        title={t('catalog.emptyTitle')}
        message={t('catalog.emptyMessage')}
      />
    );
  };

  return (
    <AnimatedFlashList
      ref={listRef}
      data={products}
      numColumns={GRID_COLUMNS}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      onScroll={onScroll}
      maintainVisibleContentPosition={NO_POSITION_ANCHORING}
      scrollEventThrottle={16}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.6}
      showsVerticalScrollIndicator={false}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        ...styles.content,
        paddingTop: topInset,
        paddingBottom: bottom + spacing.xl,
      }}
      scrollIndicatorInsets={{ top: topInset }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
          colors={[colors.accent]}
          progressBackgroundColor={colors.surface}
          progressViewOffset={topInset}
        />
      }
      ListHeaderComponent={header}
      ListEmptyComponent={<View style={styles.empty}>{renderEmpty()}</View>}
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
  empty: {
    minHeight: 360,
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
