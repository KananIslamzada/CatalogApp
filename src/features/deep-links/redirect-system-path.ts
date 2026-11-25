import { showAppDialog } from '@/components/ui/app-dialog';
import { t } from '@/i18n';

import { parseDeepLink } from './parse-deep-link';
import { usePendingLinkStore } from './pending-link-store';

function stayOnCurrentScreen(initial: boolean) {
  return initial ? '/' : null;
}

export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  try {
    const link = parseDeepLink(path);

    switch (link.kind) {
      case 'passthrough':
        return path;
      case 'product':
        usePendingLinkStore.getState().setPendingProduct(link.id);
        return stayOnCurrentScreen(initial);
      case 'invalid-product':
        showAppDialog({
          title: t('links.invalidProductTitle'),
          message: t('links.invalidProductMessage'),
        });
        return stayOnCurrentScreen(initial);
      case 'unknown':
        showAppDialog({
          title: t('links.unsupportedTitle'),
          message: t('links.unsupportedMessage'),
        });
        return stayOnCurrentScreen(initial);
    }
  } catch {
    return stayOnCurrentScreen(initial);
  }
}
