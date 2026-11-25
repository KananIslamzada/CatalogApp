import { createMMKV } from 'react-native-mmkv';
import { type z } from 'zod';

export const kvStorage = createMMKV({ id: 'catalog' });

export function readJson<T>(key: string, schema: z.ZodType<T>): T | null {
  const raw = kvStorage.getString(key);
  if (raw === undefined) return null;

  try {
    const result = schema.safeParse(JSON.parse(raw));
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function writeJson<T>(key: string, value: T): void {
  kvStorage.set(key, JSON.stringify(value));
}

export function clearKvStorage(): void {
  kvStorage.clearAll();
}
