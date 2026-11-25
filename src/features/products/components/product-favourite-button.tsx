import { memo } from 'react';

import { useFavouriteToggle } from '../hooks/use-favourites';
import { type Product } from '../types';
import FavouriteButton from './favourite-button';

function ProductFavouriteButton({ product }: { product: Product }) {
  const { isFavourite, toggle } = useFavouriteToggle(product);
  return <FavouriteButton isFavourite={isFavourite} onToggle={toggle} testID="product-favourite" />;
}

export default memo(ProductFavouriteButton);
