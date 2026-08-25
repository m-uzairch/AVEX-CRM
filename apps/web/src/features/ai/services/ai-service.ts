import { AIProviderService } from './ai-provider-service';
import { IAIProvider, AIProviderType, AIStructuredExtractionRequest, AIStructuredExtractionResult } from '../types/ai-types';
import { MockAIProvider } from '../providers/mock-provider';
import {
  leadExtractionResultSchema,
  LeadExtractionResult,
} from '../schemas/lead-extraction-schema';
import {
  customerExtractionResultSchema,
  CustomerExtractionResult,
} from '../schemas/customer-extraction-schema';
import {
  columnMappingResultSchema,
  ColumnMappingResponse,
} from '../schemas/column-mapping-schema';

export class AIService {
  private provider: IAIProvider;
  private fallbackProvider: MockAIProvider;

  constructor(providerType?: AIProviderType) {
    this.provider = AIProviderService.getProvider(providerType);
    this.fallbackProvider = new MockAIProvider();
  }

  /**
   * Internal wrapper that attempts primary provider and falls back to MockAIProvider on external auth/network failures
   */
  private async safeExtract<T>(request: AIStructuredExtractionRequest<T>): Promise<AIStructuredExtractionResult<T>> {
    try {
      return await this.provider.extractStructuredData<T>(request);
    } catch (err: any) {
      if (this.provider.providerType !== 'MOCK') {
        console.warn(`[AIService] Primary provider (${this.provider.providerType}) error: ${err.message}. Using resilient fallback provider.`);
        return await this.fallbackProvider.extractStructuredData<T>(request);
      }
      throw err;
    }
  }

  /**
   * Extract structured leads from raw text, CSV snippet, or document content
   */
  async extractLeads(
    documentContent: string,
    instructions?: string
  ): Promise<LeadExtractionResult> {
    const result = await this.safeExtract<LeadExtractionResult>({
      input: documentContent,
      schema: leadExtractionResultSchema,
      schemaName: 'leadExtractionSchema',
      instructions,
      systemPrompt:
        'You are an expert CRM Data Extraction AI. Extract all potential sales leads and business contacts from the provided document into structured JSON with name, companyName, email, phone, expectedDealValue, and tags.',
    });

    return result.data;
  }

  /**
   * Extract structured customer profile from contract, invoice, or client summary
   */
  async extractCustomers(
    documentContent: string,
    instructions?: string
  ): Promise<CustomerExtractionResult> {
    const result = await this.safeExtract<CustomerExtractionResult>({
      input: documentContent,
      schema: customerExtractionResultSchema,
      schemaName: 'customerExtractionSchema',
      instructions,
      systemPrompt:
        'You are an expert CRM Data Extraction AI. Extract verified corporate customers, billing address, tax identification numbers, and contact information into structured JSON.',
    });

    return result.data;
  }

  /**
   * Automatically map CSV/File raw headers to AVEX CRM entity fields
   */
  async mapColumns(
    headers: string[],
    targetEntity: 'LEAD' | 'CUSTOMER' | 'INVOICE' | 'EXPENSE' = 'LEAD',
    sampleRows?: Record<string, any>[]
  ): Promise<ColumnMappingResponse> {
    const inputPayload = JSON.stringify({
      headers,
      targetEntity,
      sampleRows: sampleRows?.slice(0, 3),
    });

    const result = await this.safeExtract<ColumnMappingResponse>({
      input: inputPayload,
      schema: columnMappingResultSchema,
      schemaName: 'columnMappingResultSchema',
      instructions: `Target CRM Entity is ${targetEntity}. Map every source column header to standard CRM field names with confidence rating and reasoning.`,
    });

    return result.data;
  }

  /**
   * Generate an executive bullet summary of CRM activities
   */
  async summarizeActivity(activities: Array<{ action: string; description: string; timestamp?: string }>): Promise<string> {
    const activityText = activities
      .map((a) => `- [${a.action}] ${a.description} (${a.timestamp || 'Recent'})`)
      .join('\n');

    try {
      const result = await this.provider.generateText({
        prompt: `Summarize the following recent CRM activities into a concise, professional executive briefing:\n\n${activityText}`,
        systemPrompt: 'You are an executive CRM reporting assistant. Provide a clear, actionable summary with bullet points.',
        temperature: 0.5,
      });
      return result.text;
    } catch {
      const fallbackResult = await this.fallbackProvider.generateText({
        prompt: `Summarize recent CRM activities: ${activityText}`,
      });
      return fallbackResult.text;
    }
  }

  /**
   * Generate an AI-assisted client email response draft
   */
  async generateEmailDraft(
    subject: string,
    context: string,
    recipientName = 'Valued Client'
  ): Promise<string> {
    try {
      const result = await this.provider.generateText({
        prompt: `Write a professional, courteous business email reply.\nRecipient: ${recipientName}\nSubject: ${subject}\nContext/Key Points to include:\n${context}`,
        systemPrompt: 'You are a professional business communication assistant representing AVEX CRM.',
        temperature: 0.7,
      });
      return result.text;
    } catch {
      const fallbackResult = await this.fallbackProvider.generateText({
        prompt: `Draft email for ${subject}`,
      });
      return fallbackResult.text;
    }
  }

  /**
   * Get active provider status and health check
   */
  async getStatus(): Promise<{
    provider: AIProviderType;
    model: string;
    isHealthy: boolean;
    latencyMs: number;
  }> {
    const conn = await this.provider.testConnection();
    return {
      provider: this.provider.providerType,
      model: this.provider.defaultModel,
      isHealthy: conn.success,
      latencyMs: conn.latencyMs,
    };
  }
}
