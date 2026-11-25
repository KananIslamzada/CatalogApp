import { StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { Screen } from '@/components/ui';
import { LoginForm, LoginHeader } from '@/features/auth';
import { spacing } from '@/theme';

export default function LoginScreen() {
  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAwareScrollView
        bottomOffset={spacing.xl}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
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
