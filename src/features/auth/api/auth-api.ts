import { z } from 'zod';

import { apiClient } from '@/lib/api';
import { config } from '@/lib/config';
import { type AuthTokens } from '@/lib/secure-storage';

import { userSchema, type Credentials, type User } from '../types';

const loginResponseSchema = userSchema.extend({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export async function login(credentials: Credentials): Promise<{ user: User; tokens: AuthTokens }> {
  const { accessToken, refreshToken, ...user } = await apiClient.request(
    '/auth/login',
    loginResponseSchema,
    {
      method: 'POST',
      auth: false,
      body: { ...credentials, expiresInMins: config.tokenLifetimeMins },
    },
  );
  return { user, tokens: { accessToken, refreshToken } };
}
