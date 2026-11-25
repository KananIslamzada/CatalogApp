import { LogOut } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { useSessionStore, useSignOut } from '@/features/auth';
import { useTranslation } from '@/i18n';
import { spacing, useScaledSize, useTheme } from '@/theme';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const firstName = useSessionStore((state) => state.user?.firstName ?? '');
  const { signOut, isSigningOut } = useSignOut();
  const iconSize = useScaledSize(18);

  return (
    <Screen>
      <View style={styles.container}>
        <Text variant="title" accessibilityRole="header">
          {t('home.greeting', { name: firstName })}
        </Text>
        <Button
          title={t('auth.signOut')}
          variant="secondary"
          loading={isSigningOut}
          onPress={signOut}
          icon={<LogOut size={iconSize} color={colors.accent} />}
          testID="sign-out"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xl,
    padding: spacing.xl,
  },
});
