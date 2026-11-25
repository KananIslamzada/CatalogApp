import { type ErrorBoundaryProps } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { TriangleAlert } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { StateView } from '@/components/ui';
import { useTranslation } from '@/i18n';
import { errorReporter } from '@/lib/error-reporting';
import { useTheme } from '@/theme';

export default function AppErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  useEffect(() => {
    errorReporter.captureException(error, { source: 'error-boundary' });
    SplashScreen.hideAsync().catch(() => undefined);
  }, [error]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StateView
        icon={<TriangleAlert size={48} color={colors.textMuted} />}
        title={t('errors.crashTitle')}
        message={t('errors.crashMessage')}
        actionLabel={t('common.retry')}
        onAction={retry}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
