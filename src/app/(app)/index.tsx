import { Screen } from '@/components/ui';
import { CatalogHeader, ProductList } from '@/features/products';

export default function CatalogScreen() {
  return (
    <Screen>
      <CatalogHeader />
      <ProductList />
    </Screen>
  );
}
