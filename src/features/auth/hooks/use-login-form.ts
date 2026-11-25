import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useTranslation, type TranslationKey } from '@/i18n';
import { errorMessageKey, isApiError } from '@/lib/api';
import { haptics } from '@/lib/haptics';

import { useSessionStore } from '../session-store';

function loginErrorKey(error: unknown): TranslationKey {
  if (isApiError(error) && (error.status === 400 || error.status === 401)) {
    return 'auth.invalidCredentials';
  }
  return errorMessageKey(error);
}

export function useLoginForm() {
  const { t } = useTranslation();
  const signIn = useSessionStore((state) => state.signIn);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSigningIn, setSigningIn] = useState(false);

  const schema = useMemo(
    () =>
      z.object({
        username: z.string().trim().min(1, t('auth.usernameRequired')),
        password: z.string().min(1, t('auth.passwordRequired')),
      }),
    [t],
  );

  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = useCallback(() => {
    handleSubmit(async (values) => {
      setSigningIn(true);
      try {
        await signIn(values);
        setSubmitError(null);
        haptics.success();
      } catch (error) {
        haptics.error();
        setSubmitError(t(loginErrorKey(error)));
      } finally {
        setSigningIn(false);
      }
    }, haptics.warning)();
  }, [handleSubmit, signIn, t]);

  return {
    control,
    errors: formState.errors,
    isSubmitting: isSigningIn,
    submitError,
    onSubmit,
  };
}
