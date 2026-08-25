import { IAIProvider, AIProviderType } from '../types/ai-types';
import { MockAIProvider } from '../providers/mock-provider';
import { OpenAIProvider } from '../providers/openai-provider';
import { GeminiProvider } from '../providers/gemini-provider';

export class AIProviderService {
  private static providers: Map<AIProviderType, IAIProvider> = new Map();

  /**
   * Resolves the configured active AI provider based on environment and available keys.
   */
  static getProvider(type?: AIProviderType): IAIProvider {
    const selectedType: AIProviderType =
      type ||
      (process.env.AI_PROVIDER as AIProviderType) ||
      (process.env.OPENAI_API_KEY ? 'OPENAI' : process.env.GEMINI_API_KEY ? 'GEMINI' : 'MOCK');

    if (!this.providers.has(selectedType)) {
      this.providers.set(selectedType, this.instantiateProvider(selectedType));
    }

    return this.providers.get(selectedType)!;
  }

  /**
   * Instantiates a new provider instance
   */
  private static instantiateProvider(type: AIProviderType): IAIProvider {
    switch (type) {
      case 'OPENAI':
        return new OpenAIProvider();
      case 'GEMINI':
        return new GeminiProvider();
      case 'MOCK':
      default:
        return new MockAIProvider();
    }
  }

  /**
   * Resets registered providers (useful for testing or key rotation)
   */
  static reset(): void {
    this.providers.clear();
  }
}
