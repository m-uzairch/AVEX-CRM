import { BaseAIProvider } from './base-provider';
import {
  AIProviderType,
  AITextGenerationRequest,
  AITextGenerationResult,
  AIStructuredExtractionRequest,
  AIStructuredExtractionResult,
} from '../types/ai-types';
import { AIValidationError } from '../utils/ai-error-handler';

export class MockAIProvider extends BaseAIProvider {
  readonly providerType: AIProviderType = 'MOCK';
  readonly defaultModel = 'avex-mock-extractor-v1';

  async generateText(request: AITextGenerationRequest): Promise<AITextGenerationResult> {
    const startTime = Date.now();

    let responseText = `[Mock AI Response]: Processed prompt "${request.prompt.substring(0, 50)}..." successfully.`;

    if (request.prompt.toLowerCase().includes('summary') || request.prompt.toLowerCase().includes('activity')) {
      responseText = 'Executive Summary: Recent enterprise CRM activities indicate strong sales pipeline velocity across Cloud Infrastructure deals and 100% on-time client deliverable milestones.';
    } else if (request.prompt.toLowerCase().includes('email')) {
      responseText = 'Dear Client,\n\nThank you for reaching out regarding our Enterprise Services. We have confirmed your requirements and look forward to our scheduled alignment call tomorrow.\n\nBest regards,\nAVEX CRM Team';
    }

    return {
      text: responseText,
      provider: this.providerType,
      model: this.defaultModel,
      usage: {
        promptTokens: Math.ceil(request.prompt.length / 4),
        completionTokens: Math.ceil(responseText.length / 4),
        totalTokens: Math.ceil((request.prompt.length + responseText.length) / 4),
      },
      durationMs: Date.now() - startTime + 5,
    };
  }

  /**
   * High-fidelity structured extraction with heuristic parsing for mock/offline usage
   */
  async extractStructuredData<T>(
    request: AIStructuredExtractionRequest<T>
  ): Promise<AIStructuredExtractionResult<T>> {
    const startTime = Date.now();
    const input = request.input || '';

    // Smart heuristic mock data generation based on schemaName
    let mockResult: any;

    if (request.schemaName === 'leadExtractionSchema' || request.schemaName.toLowerCase().includes('lead')) {
      // Find emails
      const emailMatches = input.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || ['contact@enterprise.com'];
      const phoneMatches = input.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || ['+1 (800) 555-0199'];

      mockResult = {
        leads: [
          {
            name: 'Jordan Hayes',
            companyName: 'Acme Cloud Dynamics',
            email: emailMatches[0] || 'jordan.hayes@acmecloud.com',
            phone: phoneMatches[0] || '+1 (555) 234-5678',
            industry: 'Technology & Cloud Infrastructure',
            country: 'United States',
            city: 'San Francisco',
            address: '500 Howard Street, Suite 400',
            postalCode: '94105',
            website: 'https://acmecloud.com',
            expectedDealValue: 35000,
            source: 'AI Extraction',
            priority: 'HIGH',
            tags: ['Cloud', 'Enterprise', 'High-Priority'],
            confidenceScore: 0.94,
          },
        ],
        totalExtracted: 1,
        extractionSummary: 'Extracted 1 enterprise lead record with full contact and firmographic attributes.',
      };
    } else if (request.schemaName === 'customerExtractionSchema' || request.schemaName.toLowerCase().includes('customer')) {
      mockResult = {
        customers: [
          {
            name: 'Starlight Media Group',
            companyName: 'Starlight Media Group LLC',
            email: 'billing@starlightmedia.com',
            phone: '+1 (555) 890-1234',
            billingAddress: '742 Evergreen Terrace, Suite 100, New York, NY 10001',
            taxNumber: 'US-EIN-94-2039182',
            currency: 'USD',
            status: 'ACTIVE',
            notes: 'High-value media accounts customer with monthly retainer',
            confidenceScore: 0.92,
          },
        ],
        totalExtracted: 1,
        extractionSummary: 'Extracted 1 customer profile with tax EIN and verified billing address.',
      };
    } else if (request.schemaName === 'columnMappingResultSchema' || request.schemaName.toLowerCase().includes('column')) {
      // Smart header mapping mock
      let headers: string[] = [];
      try {
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed.headers)) {
          headers = parsed.headers;
        }
      } catch {
        // Not JSON
      }

      if (headers.length === 0) {
        headers = ['Name', 'Company', 'Email', 'Phone Number', 'Estimated Value'];
      }

      const fieldMap: Record<string, string> = {
        name: 'name',
        'contact name': 'name',
        'lead name': 'name',
        'full name': 'name',
        company: 'companyName',
        'company name': 'companyName',
        organization: 'companyName',
        org: 'companyName',
        email: 'email',
        'email address': 'email',
        phone: 'phone',
        'phone number': 'phone',
        telephone: 'phone',
        mobile: 'phone',
        value: 'expectedDealValue',
        'estimated value': 'expectedDealValue',
        'deal value': 'expectedDealValue',
        industry: 'industry',
        address: 'address',
        country: 'country',
        city: 'city',
        website: 'website',
        status: 'status',
      };

      const mappings = headers.map((h: string) => {
        const normalized = h.toLowerCase().trim();
        const target = fieldMap[normalized] || 'notes';
        return {
          sourceColumn: h,
          targetField: target,
          confidence: fieldMap[normalized] ? 0.95 : 0.6,
          reasoning: fieldMap[normalized]
            ? `Exact semantic match between source "${h}" and CRM field "${target}"`
            : `Fuzzy mapped to "${target}" based on text analysis`,
        };
      });

      mockResult = {
        mappings,
        unmappedColumns: [],
        targetEntity: 'LEAD',
      };
    } else {
      mockResult = {
        data: { parsed: true, source: input },
      };
    }

    const validation = request.schema.safeParse(mockResult);
    if (!validation.success) {
      throw new AIValidationError(
        this.providerType,
        `Mock extracted data failed validation for "${request.schemaName}"`,
        validation.error.issues
      );
    }

    return {
      data: validation.data,
      confidenceScore: 0.95,
      provider: this.providerType,
      model: this.defaultModel,
      rawResponse: JSON.stringify(mockResult),
      durationMs: Date.now() - startTime + 5,
    };
  }

  async testConnection(): Promise<{ success: boolean; latencyMs: number; message: string }> {
    return {
      success: true,
      latencyMs: 3,
      message: 'Mock AI Provider is operational and ready.',
    };
  }
}
