import { useDialogStore } from '@/components/ui/app-dialog/dialog-store';

import { usePendingLinkStore } from '../pending-link-store';
import { redirectSystemPath } from '../redirect-system-path';

describe('redirectSystemPath', () => {
  beforeEach(() => {
    usePendingLinkStore.getState().clear();
    useDialogStore.setState({ current: null, queue: [] });
  });

  it('parks a product link and opens the app at its root on cold start', () => {
    expect(redirectSystemPath({ path: 'catalog://product/42', initial: true })).toBe('/');
    expect(usePendingLinkStore.getState().productId).toBe(42);
  });

  it('parks a product link and keeps the current screen while running', () => {
    expect(redirectSystemPath({ path: 'catalog://product/42', initial: false })).toBeNull();
    expect(usePendingLinkStore.getState().productId).toBe(42);
  });

  it('lets app routes through untouched', () => {
    expect(redirectSystemPath({ path: 'catalog://login', initial: false })).toBe('catalog://login');
    expect(useDialogStore.getState().current).toBeNull();
  });

  it('explains a broken product link instead of navigating', () => {
    expect(redirectSystemPath({ path: 'catalog://product/abc', initial: false })).toBeNull();

    expect(useDialogStore.getState().current?.title).toBe('Product link is broken');
    expect(usePendingLinkStore.getState().productId).toBeNull();
  });

  it('explains an unsupported link and still opens the app on cold start', () => {
    expect(redirectSystemPath({ path: 'catalog://settings', initial: true })).toBe('/');

    expect(useDialogStore.getState().current?.title).toBe('Link not supported');
  });
});
