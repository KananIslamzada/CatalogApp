import { StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen } from '@/components/ui';
import { LoginForm, LoginHeader } from '@/features/auth';
import { spacing } from '@/theme';

export default function LoginScreen() {
  const { bottom } = useSafeAreaInsets();

  return (
    <Screen>
      <KeyboardAwareScrollView
        bottomOffset={spacing.md}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: bottom + spacing.xl }]}
      >
        <LoginHeader />
        <LoginForm />
      </KeyboardAwareScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.xxl,
    padding: spacing.xl,
  },
});
