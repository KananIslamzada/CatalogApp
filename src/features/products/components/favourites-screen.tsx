import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { router } from 'expo-router';
import { ChevronLeft, Heart } from 'lucide-react-native';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton, Screen, StateView, Text } from '@/components/ui';
import { useTranslation } from '@/i18n';
import { spacing, useScaledSize, useTheme } from '@/theme';

import { useFavourites } from '../hooks/use-favourites';
import { useOpenProduct } from '../hooks/use-open-product';
import { type Product } from '../types';
import { GRID_COLUMNS, GRID_GAP, GRID_PADDING, TOP_BAR_HEIGHT } from './layout';
import ProductCard from './product-card';

const keyExtractor = (product: Product) => String(product.id);

export default function FavouritesScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { bottom } = useSafeAreaInsets();
  const iconSize = useScaledSize(24);
  const { data: favourites = [], isPending } = useFavourites();
  const openProduct = useOpenProduct();

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, []);

  const renderItem: ListRenderItem<Product> = useCallback(
    ({ item, index }) => (
      <View style={index % GRID_COLUMNS === 0 ? styles.leftCell : styles.rightCell}>
        <ProductCard product={item} onPress={openProduct} />
      </View>
    ),
    [openProduct],
  );

  return (
    <Screen>
      <View style={styles.bar}>
        <IconButton
          filled
          accessibilityLabel={t('common.back')}
          onPress={goBack}
          icon={<ChevronLeft size={iconSize} color={colors.textPrimary} />}
        />
      </View>
      <FlashList
        data={favourites}
        numColumns={GRID_COLUMNS}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ ...styles.content, paddingBottom: bottom + spacing.xl }}
        ListHeaderComponent={
          <Text variant="display" accessibilityRole="header" style={styles.title}>
            {t('favourites.title')}
          </Text>
        }
        ListEmptyComponent={
          isPending ? null : (
            <View style={styles.empty}>
              <StateView
                icon={<Heart size={44} color={colors.textMuted} />}
                title={t('favourites.emptyTitle')}
                message={t('favourites.emptyMessage')}
              />
            </View>
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: TOP_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: GRID_PADDING,
  },
  content: {
    paddingHorizontal: GRID_PADDING,
  },
  title: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
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
