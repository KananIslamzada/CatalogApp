import { useLocalSearchParams } from 'expo-router';

import { parseProductId } from '@/features/deep-links';
import { parseProductSource, ProductDetailsScreen } from '@/features/products';

export default function ProductScreen() {
  const { id, from } = useLocalSearchParams<{ id: string; from?: string }>();
  return <ProductDetailsScreen id={parseProductId(id)} source={parseProductSource(from)} />;
}
