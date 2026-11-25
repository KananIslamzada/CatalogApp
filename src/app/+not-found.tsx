import { router } from 'expo-router';
import { Compass } from 'lucide-react-native';
import { useCallback } from 'react';

import { Screen, StateView } from '@/components/ui';
import { useTranslation } from '@/i18n';
import { useTheme } from '@/theme';

export default function NotFoundScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const goHome = useCallback(() => router.replace('/'), []);

  return (
    <Screen>
      <StateView
        icon={<Compass size={48} color={colors.textMuted} />}
        title={t('notFound.title')}
        message={t('notFound.message')}
        actionLabel={t('common.goHome')}
        onAction={goHome}
      />
    </Screen>
  );
}
