import { z } from 'zod';

export type AIProviderType = 'OPENAI' | 'GEMINI' | 'ANTHROPIC' | 'OLLAMA' | 'MOCK';

export interface AIModelConfig {
  provider: AIProviderType;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AITextGenerationRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

export interface AITextGenerationResult {
  text: string;
  provider: AIProviderType;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  durationMs: number;
}

export interface AIStructuredExtractionRequest<T> {
  input: string;
  schema: z.ZodType<T, any, any>;
  schemaName: string;
  systemPrompt?: string;
  instructions?: string;
  temperature?: number;
}

export interface AIStructuredExtractionResult<T> {
  data: T;
  confidenceScore: number; // 0 to 1
  provider: AIProviderType;
  model: string;
  rawResponse?: string;
  durationMs: number;
}

export interface ColumnMappingResult {
  sourceColumn: string;
  targetField: string;
  confidence: number;
  reasoning?: string;
}

export interface IAIProvider {
  readonly providerType: AIProviderType;
  readonly defaultModel: string;

  /**
   * Generates unstructured natural text response
   */
  generateText(request: AITextGenerationRequest): Promise<AITextGenerationResult>;

  /**
   * Extracts and validates structured data against a Zod schema
   */
  extractStructuredData<T>(
    request: AIStructuredExtractionRequest<T>
  ): Promise<AIStructuredExtractionResult<T>>;

  /**
   * Health check / capability test
   */
  testConnection(): Promise<{ success: boolean; latencyMs: number; message: string }>;
}
