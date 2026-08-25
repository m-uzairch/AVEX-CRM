export class AIProviderError extends Error {
  readonly provider: string;
  readonly statusCode?: number;

  constructor(message: string, provider: string, statusCode?: number) {
    super(`[AI Error - ${provider}] ${message}`);
    this.name = 'AIProviderError';
    this.provider = provider;
    this.statusCode = statusCode;
  }
}

export class AIRateLimitError extends AIProviderError {
  constructor(provider: string, message = 'Rate limit exceeded. Please retry in a few moments.') {
    super(message, provider, 429);
    this.name = 'AIRateLimitError';
  }
}

export class AIAuthenticationError extends AIProviderError {
  constructor(provider: string, message = 'Invalid or missing AI API Key.') {
    super(message, provider, 401);
    this.name = 'AIAuthenticationError';
  }
}

export class AIValidationError extends AIProviderError {
  readonly validationIssues: any[];

  constructor(provider: string, message: string, issues: any[] = []) {
    super(message, provider, 422);
    this.name = 'AIValidationError';
    this.validationIssues = issues;
  }
}
