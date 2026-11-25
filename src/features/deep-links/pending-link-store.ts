import { create } from 'zustand';

type PendingLinkState = {
  productId: number | null;
  setPendingProduct: (productId: number) => void;
  clear: () => void;
};

export const usePendingLinkStore = create<PendingLinkState>()((set) => ({
  productId: null,
  setPendingProduct: (productId) => set({ productId }),
  clear: () => set({ productId: null }),
}));
