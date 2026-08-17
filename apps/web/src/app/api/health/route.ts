import { NextResponse } from 'next/server';
import { checkDatabaseHealth } from '@/lib/database/health';
import { env } from '@/config/env';

export async function GET() {
  const dbHealth = await checkDatabaseHealth();

  const isSupabaseConfigured =
    Boolean(env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
    env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-project.supabase.co';

  return NextResponse.json(
    {
      status: dbHealth.status === 'healthy' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
      services: {
        database: {
          status: dbHealth.status,
          message: dbHealth.message,
          latencyMs: dbHealth.latencyMs,
        },
        supabase: {
          configured: isSupabaseConfigured,
          status: isSupabaseConfigured ? 'configured' : 'placeholder',
        },
      },
    },
    { status: 200 }
  );
}
