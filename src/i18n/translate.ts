import az from './locales/az.json';
import en from './locales/en.json';

export type Dictionary = typeof en;

type Leaves<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends string ? `${Prefix}${K}` : Leaves<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type TranslationKey = Leaves<Dictionary>;
export type Locale = 'en' | 'az';
export type TranslationParams = Record<string, string | number>;

const dictionaries: Record<Locale, Dictionary> = { en, az };

export const supportedLocales = Object.keys(dictionaries) as Locale[];

export function resolveLocale(languageCode: string | null | undefined): Locale {
  return supportedLocales.find((locale) => locale === languageCode) ?? 'en';
}

function lookup(dictionary: Dictionary, key: TranslationKey): string | undefined {
  let node: unknown = dictionary;
  for (const part of key.split('.')) {
    if (typeof node !== 'object' || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === 'string' ? node : undefined;
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

export function translate(locale: Locale, key: TranslationKey, params?: TranslationParams): string {
  const template = lookup(dictionaries[locale], key) ?? lookup(dictionaries.en, key) ?? key;
  return interpolate(template, params);
}
