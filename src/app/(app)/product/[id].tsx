import { useLocalSearchParams } from 'expo-router';

import { parseProductId } from '@/features/deep-links';
import { ProductDetailsScreen } from '@/features/products';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ProductDetailsScreen id={parseProductId(id)} />;
}
