import { useCallback, useMemo, useState } from 'react';
import { type SharedValue } from 'react-native-reanimated';

import { useProductQuery } from './use-product-query';

type ViewerState = { index: number; galleryTop: number };

export function useProductDetails(id: number, scrollY: SharedValue<number>) {
  const { data, error, refetch } = useProductQuery(id);
  const product = data?.product;
  const [revealOnLoad] = useState(() => data === undefined);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [viewer, setViewer] = useState<ViewerState | null>(null);

  const pages = useMemo(() => {
    if (!product) return [];
    return product.images.length > 0 ? product.images : [product.thumbnail];
  }, [product]);

  const openViewer = useCallback(
    (index: number) => setViewer({ index, galleryTop: -Math.max(0, scrollY.get()) }),
    [scrollY],
  );
  const closeViewer = useCallback(() => setViewer(null), []);
  const retry = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    product,
    error: product ? null : error,
    retry,
    revealOnLoad,
    pages,
    galleryIndex,
    setGalleryIndex,
    viewer,
    openViewer,
    closeViewer,
  };
}
