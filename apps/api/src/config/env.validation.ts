import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('7d'),
  RESEND_API_KEY: z.string().optional(),
  MAIL_FROM: z.string().default('Claro de Luna <onboarding@resend.dev>'),
  // Comma-separated emails granted the `qa` role at login (can view the entrance code).
  QA_EMAILS: z.string().default('kanekydanfort@gmail.com'),
  // Comma-separated emails granted the `admin` role: everything `qa` can do,
  // plus regenerating the entrance code on demand.
  ADMIN_EMAILS: z.string().default('dlunaj95@gmail.com'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  return envSchema.parse(config);
}
