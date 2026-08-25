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

export class GeminiProvider extends BaseAIProvider {
  readonly providerType: AIProviderType = 'GEMINI';
  readonly defaultModel: string;
  private readonly apiKey: string;

  constructor(apiKey?: string, model = 'gemini-1.5-flash') {
    super();
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    this.defaultModel = model;
  }

  async generateText(request: AITextGenerationRequest): Promise<AITextGenerationResult> {
    if (!this.apiKey) {
      throw new AIAuthenticationError('GEMINI', 'GEMINI_API_KEY is not configured in environment or settings.');
    }

    const startTime = Date.now();
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.defaultModel}:generateContent?key=${this.apiKey}`;

    const promptText = request.systemPrompt
      ? `${request.systemPrompt}\n\nUser Request: ${request.prompt}`
      : request.prompt;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: request.temperature ?? 0.7,
            maxOutputTokens: request.maxTokens ?? 1000,
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errMsg = errorData.error?.message || res.statusText;

        if (res.status === 400 && errMsg.includes('API key')) {
          throw new AIAuthenticationError('GEMINI', errMsg);
        }
        if (res.status === 429) {
          throw new AIRateLimitError('GEMINI', errMsg);
        }
        throw new AIProviderError(errMsg, 'GEMINI', res.status);
      }

      const data = await res.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      return {
        text: content,
        provider: 'GEMINI',
        model: this.defaultModel,
        usage: data.usageMetadata
          ? {
              promptTokens: data.usageMetadata.promptTokenCount,
              completionTokens: data.usageMetadata.candidatesTokenCount,
              totalTokens: data.usageMetadata.totalTokenCount,
            }
          : undefined,
        durationMs: Date.now() - startTime,
      };
    } catch (err: any) {
      if (err instanceof AIProviderError) throw err;
      throw new AIProviderError(err.message || 'Network error connecting to Google Gemini API', 'GEMINI');
    }
  }

  async testConnection(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    const startTime = Date.now();
    try {
      await this.generateText({ prompt: 'Ping: reply pong', maxTokens: 5 });
      return {
        success: true,
        latencyMs: Date.now() - startTime,
        message: 'Google Gemini API connected successfully.',
      };
    } catch (err: any) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        message: err.message || 'Failed to connect to Google Gemini API.',
      };
    }
  }
}
