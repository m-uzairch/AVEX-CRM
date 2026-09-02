import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().default('https://placeholder-project.supabase.co'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).default('placeholder-anon-key'),
  DATABASE_URL: z.string().min(1).default('postgresql://postgres:postgres@localhost:5432/avex_crm?schema=public'),
  DIRECT_URL: z.string().min(1).default('postgresql://postgres:postgres@localhost:5432/avex_crm?schema=public'),
  REDIS_URL: z.string().optional().default('redis://localhost:6379'),
  GEMINI_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  JWT_SECRET: z.string().optional().default('avex_crm_secure_jwt_secret_dev_32char_minimum!'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

function validateEnv() {
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error(
        'CRITICAL SECURITY ERROR: JWT_SECRET environment variable is missing or shorter than 32 characters in production.'
      );
    }
  }

  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    REDIS_URL: process.env.REDIS_URL,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    JWT_SECRET: process.env.JWT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    // Log warnings in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ Environment variables warning:', parsed.error.format());
    }
    return envSchema.parse({});
  }

  return parsed.data;
}

export const env = validateEnv();
