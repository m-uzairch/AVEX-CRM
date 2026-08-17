/**
 * AVEX CRM — Email Environment Configuration
 *
 * Validates required environment variables for the Email Service at startup.
 * Throws a structured ConfigurationError on failure — caught by EmailService
 * so unrelated API routes are never affected.
 */

export class EmailConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailConfigurationError';
  }
}

export interface EmailEnvConfig {
  apiKey: string;
  fromAddress: string;
  appUrl: string;
}

/**
 * Validate and return email environment configuration.
 * Call this inside the Email Service — not at module load time —
 * so that missing vars only surface when email is actually needed.
 */
export function getEmailEnvConfig(): EmailEnvConfig {
  const rawApiKey = process.env.RESEND_API_KEY || '';
  const apiKey = rawApiKey.trim();
  const fromAddress =
    process.env.EMAIL_FROM || 'onboarding@resend.dev';
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!apiKey) {
    throw new EmailConfigurationError(
      '[Email Service] RESEND_API_KEY is not configured. ' +
        'Add RESEND_API_KEY to your .env.local file. ' +
        'Get your key at https://resend.com/api-keys'
    );
  }

  if (!apiKey.startsWith('re_')) {
    throw new EmailConfigurationError(
      '[Email Service] RESEND_API_KEY appears to be invalid. ' +
        'Resend API keys must start with "re_".'
    );
  }

  return { apiKey, fromAddress, appUrl };
}
