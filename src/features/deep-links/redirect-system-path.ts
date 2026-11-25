import { parseProductLink } from './parse-product-link';
import { usePendingLinkStore } from './pending-link-store';

export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  try {
    const productId = parseProductLink(path);
    if (productId === null) return path;

    usePendingLinkStore.getState().setPendingProduct(productId);
    return initial ? '/' : null;
  } catch {
    return initial ? '/' : null;
  }
}
