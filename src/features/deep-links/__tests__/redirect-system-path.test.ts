import { usePendingLinkStore } from '../pending-link-store';
import { redirectSystemPath } from '../redirect-system-path';

describe('redirectSystemPath', () => {
  beforeEach(() => {
    usePendingLinkStore.getState().clear();
  });

  it('parks a product link and opens the app at its root on cold start', () => {
    expect(redirectSystemPath({ path: 'catalog://product/42', initial: true })).toBe('/');
    expect(usePendingLinkStore.getState().productId).toBe(42);
  });

  it('parks a product link and keeps the current screen while running', () => {
    expect(redirectSystemPath({ path: 'catalog://product/42', initial: false })).toBeNull();
    expect(usePendingLinkStore.getState().productId).toBe(42);
  });

  it('lets every other link through untouched', () => {
    expect(redirectSystemPath({ path: 'catalog://login', initial: false })).toBe('catalog://login');
    expect(usePendingLinkStore.getState().productId).toBeNull();
  });
});
