import { BaseAIProvider } from './base-provider';
import {
  AIProviderType,
  AITextGenerationRequest,
  AITextGenerationResult,
} from '../types/ai-types';
import {
  AIAuthenticationError,
  AIRateLimitError,
  AIProviderError,
} from '../utils/ai-error-handler';

export class OpenAIProvider extends BaseAIProvider {
  readonly providerType: AIProviderType = 'OPENAI';
  readonly defaultModel: string;
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey?: string, model = 'gpt-4o-mini', baseUrl = 'https://api.openai.com/v1') {
    super();
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    this.defaultModel = model;
    this.baseUrl = baseUrl;
  }

  async generateText(request: AITextGenerationRequest): Promise<AITextGenerationResult> {
    if (!this.apiKey) {
      throw new AIAuthenticationError('OPENAI', 'OPENAI_API_KEY is not configured in environment or settings.');
    }

    const startTime = Date.now();

    const messages: Array<{ role: 'system' | 'user'; content: string }> = [];
    if (request.systemPrompt) {
      messages.push({ role: 'system', content: request.systemPrompt });
    }
    messages.push({ role: 'user', content: request.prompt });

    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.defaultModel,
          messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 1000,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errMsg = errorData.error?.message || res.statusText;

        if (res.status === 401) {
          throw new AIAuthenticationError('OPENAI', errMsg);
        }
        if (res.status === 429) {
          throw new AIRateLimitError('OPENAI', errMsg);
        }
        throw new AIProviderError(errMsg, 'OPENAI', res.status);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';

      return {
        text: content,
        provider: 'OPENAI',
        model: data.model || this.defaultModel,
        usage: data.usage
          ? {
              promptTokens: data.usage.prompt_tokens,
              completionTokens: data.usage.completion_tokens,
              totalTokens: data.usage.total_tokens,
            }
          : undefined,
        durationMs: Date.now() - startTime,
      };
    } catch (err: any) {
      if (err instanceof AIProviderError) throw err;
      throw new AIProviderError(err.message || 'Network error connecting to OpenAI API', 'OPENAI');
    }
  }

  async testConnection(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    const startTime = Date.now();
    try {
      await this.generateText({ prompt: 'Ping: Reply "pong" only.', maxTokens: 5 });
      return {
        success: true,
        latencyMs: Date.now() - startTime,
        message: 'OpenAI API connected successfully.',
      };
    } catch (err: any) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        message: err.message || 'Failed to connect to OpenAI API.',
      };
    }
  }
}
