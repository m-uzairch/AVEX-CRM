import {
  IAIProvider,
  AIProviderType,
  AITextGenerationRequest,
  AITextGenerationResult,
  AIStructuredExtractionRequest,
  AIStructuredExtractionResult,
} from '../types/ai-types';
import { AIResponseParser } from '../utils/ai-response-parser';
import { AIValidationError } from '../utils/ai-error-handler';

export abstract class BaseAIProvider implements IAIProvider {
  abstract readonly providerType: AIProviderType;
  abstract readonly defaultModel: string;

  abstract generateText(request: AITextGenerationRequest): Promise<AITextGenerationResult>;

  /**
   * Default implementation of structured data extraction.
   * Can be overridden by provider if native schema enforcement is supported.
   */
  async extractStructuredData<T>(
    request: AIStructuredExtractionRequest<T>
  ): Promise<AIStructuredExtractionResult<T>> {
    const startTime = Date.now();

    const systemPrompt =
      request.systemPrompt ||
      `You are an expert CRM data extraction assistant. Extract the requested information into a strict, valid JSON object matching the "${request.schemaName}" schema. Return ONLY valid JSON, with NO surrounding explanation, commentary, or markdown formatting outside the JSON block.`;

    const instructionsPrompt = request.instructions ? `\n\nSpecific extraction instructions: ${request.instructions}` : '';

    const fullPrompt = `Document/Input to analyze:\n"""\n${request.input}\n"""${instructionsPrompt}\n\nReturn a valid JSON object matching the required schema.`;

    const result = await this.generateText({
      prompt: fullPrompt,
      systemPrompt,
      temperature: request.temperature ?? 0.2, // Lower temperature for extraction precision
    });

    const parsedJson = AIResponseParser.extractJson<T>(result.text);

    const validation = request.schema.safeParse(parsedJson);
    if (!validation.success) {
      throw new AIValidationError(
        this.providerType,
        `Extracted data failed schema validation for "${request.schemaName}"`,
        validation.error.issues
      );
    }

    return {
      data: validation.data,
      confidenceScore: 0.9,
      provider: this.providerType,
      model: result.model,
      rawResponse: result.text,
      durationMs: Date.now() - startTime,
    };
  }

  abstract testConnection(): Promise<{ success: boolean; latencyMs: number; message: string }>;
}
