import { prisma } from './prisma';

export interface DatabaseHealthStatus {
  status: 'healthy' | 'unhealthy' | 'mock';
  latencyMs?: number;
  message: string;
}

export async function checkDatabaseHealth(): Promise<DatabaseHealthStatus> {
  const start = Date.now();
  try {
    // Perform simple query check
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;
    return {
      status: 'healthy',
      latencyMs,
      message: 'Database connection verified successfully',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    
    // In local development mode without a running Postgres server, return informative status
    if (process.env.NODE_ENV === 'development') {
      return {
        status: 'mock',
        message: `Local development mode (Database connection offline: ${errorMessage})`,
      };
    }

    return {
      status: 'unhealthy',
      message: 'Failed to establish connection to PostgreSQL',
    };
  }
}
