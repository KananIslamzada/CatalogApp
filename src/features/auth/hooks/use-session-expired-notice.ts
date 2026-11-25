import { useEffect } from 'react';

import { showAppDialog } from '@/components/ui/app-dialog';
import { useTranslation } from '@/i18n';

import { useSessionStore } from '../session-store';

export function useSessionExpiredNotice() {
  const { t } = useTranslation();
  const expired = useSessionStore((state) => state.expired);
  const acknowledgeExpiry = useSessionStore((state) => state.acknowledgeExpiry);

  useEffect(() => {
    if (!expired) return;
    acknowledgeExpiry();
    showAppDialog({
      title: t('auth.sessionExpiredTitle'),
      message: t('auth.sessionExpired'),
    });
  }, [expired, acknowledgeExpiry, t]);
}
