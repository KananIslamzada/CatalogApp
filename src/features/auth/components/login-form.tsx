import { Lock, User } from 'lucide-react-native';
import { memo, useRef, type ComponentRef } from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet, type TextInput } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

import { Button, Text, TextField } from '@/components/ui';
import { useTranslation } from '@/i18n';
import { layoutTransition, radius, spacing, useScaledSize, useTheme } from '@/theme';

import { useLoginForm } from '../hooks/use-login-form';
import { useSessionStore } from '../session-store';

function LoginForm() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const expired = useSessionStore((state) => state.expired);
  const { control, errors, isSubmitting, submitError, onSubmit } = useLoginForm();
  const fieldIconSize = useScaledSize(18);
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);

  const bannerMessage = submitError ?? (expired ? t('auth.sessionExpired') : null);

  return (
    <Animated.View
      entering={FadeInDown.duration(420).delay(80)}
      layout={layoutTransition}
      style={styles.container}
    >
      {!!bannerMessage && (
        <Animated.View
          entering={FadeInDown.duration(220)}
          exiting={FadeOutUp.duration(160)}
          layout={layoutTransition}
          style={[styles.banner, { backgroundColor: colors.dangerSoft }]}
        >
          <Text tone="danger" variant="label" accessibilityRole="alert">
            {bannerMessage}
          </Text>
        </Animated.View>
      )}

      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label={t('auth.username')}
            placeholder={t('auth.usernamePlaceholder')}
            leftIcon={<User size={fieldIconSize} color={colors.textMuted} />}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.username?.message}
            autoComplete="username"
            textContentType="username"
            returnKeyType="next"
            submitBehavior="submit"
            onSubmitEditing={() => passwordRef.current?.focus()}
            editable={!isSubmitting}
            testID="login-username"
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            ref={passwordRef}
            label={t('auth.password')}
            placeholder={t('auth.passwordPlaceholder')}
            leftIcon={<Lock size={fieldIconSize} color={colors.textMuted} />}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
            secureTextEntry
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={onSubmit}
            editable={!isSubmitting}
            testID="login-password"
          />
        )}
      />

      <Animated.View layout={layoutTransition} style={styles.actions}>
        <Button
          title={t('auth.signIn')}
          loading={isSubmitting}
          onPress={onSubmit}
          testID="login-submit"
        />
        <Text variant="caption" tone="muted" align="center">
          {t('auth.demoHint')}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.lg,
  },
  banner: {
    padding: spacing.md,
    borderRadius: radius.md,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});

export default memo(LoginForm);
