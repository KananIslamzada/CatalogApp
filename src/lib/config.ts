const DEFAULT_TOKEN_LIFETIME_MINS = 30;

function parseMinutes(value: string | undefined): number {
  const minutes = Number(value);
  return Number.isInteger(minutes) && minutes > 0 ? minutes : DEFAULT_TOKEN_LIFETIME_MINS;
}

export const config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'https://dummyjson.com',
  tokenLifetimeMins: parseMinutes(process.env.EXPO_PUBLIC_TOKEN_LIFETIME_MINS),
} as const;
