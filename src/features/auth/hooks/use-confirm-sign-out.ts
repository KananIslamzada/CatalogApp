import { useCallback } from 'react';

import { showAppDialog } from '@/components/ui/app-dialog';
import { useTranslation } from '@/i18n';

import { useSignOut } from './use-sign-out';

export function useConfirmSignOut() {
  const { t } = useTranslation();
  const { signOut, isSigningOut } = useSignOut();

  const confirmSignOut = useCallback(() => {
    showAppDialog({
      title: t('auth.signOutConfirmTitle'),
      message: t('auth.signOutConfirmMessage'),
      tone: 'danger',
      actions: [
        { label: t('auth.signOut'), onPress: signOut },
        { label: t('common.cancel'), variant: 'secondary' },
      ],
    });
  }, [signOut, t]);

  return { confirmSignOut, isSigningOut };
}
