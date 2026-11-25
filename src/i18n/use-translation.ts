import { getLocales, useLocales } from 'expo-localization';
import { useCallback } from 'react';

import {
  resolveLocale,
  translate,
  type Locale,
  type TranslationKey,
  type TranslationParams,
} from './translate';

export function useTranslation() {
  const [primary] = useLocales();
  const locale = resolveLocale(primary.languageCode);

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) => translate(locale, key, params),
    [locale],
  );

  return { t, locale };
}

export function currentLocale(): Locale {
  return resolveLocale(getLocales()[0].languageCode);
}

export function t(key: TranslationKey, params?: TranslationParams): string {
  return translate(currentLocale(), key, params);
}
