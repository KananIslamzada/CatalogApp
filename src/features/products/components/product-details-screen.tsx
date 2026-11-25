import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme';

import ProductDetails from './product-details';
import ProductNotFound from './product-not-found';
import ProductTopBar from './product-top-bar';
import { type ProductSource } from './shared-image';

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
