import { z } from 'zod';

export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  image: z.string(),
});

export type User = z.infer<typeof userSchema>;

export type Credentials = {
  username: string;
  password: string;
};
