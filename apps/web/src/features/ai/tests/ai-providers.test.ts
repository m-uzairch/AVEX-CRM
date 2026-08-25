import { describe, it, expect } from 'vitest';
import { MockAIProvider } from '../providers/mock-provider';
import { OpenAIProvider } from '../providers/openai-provider';
import { GeminiProvider } from '../providers/gemini-provider';
import { AIProviderService } from '../services/ai-provider-service';
import { leadExtractionResultSchema } from '../schemas/lead-extraction-schema';

describe('AI Providers & Factory Unit Tests', () => {
  it('MockAIProvider generates text and computes token metrics', async () => {
    const provider = new MockAIProvider();
    const result = await provider.generateText({
      prompt: 'Draft email to client',
    });

    expect(result.provider).toBe('MOCK');
    expect(result.text).toContain('Client');
    expect(result.usage?.totalTokens).toBeGreaterThan(0);
  });

  it('MockAIProvider extracts structured leads and validates schema', async () => {
    const provider = new MockAIProvider();
    const result = await provider.extractStructuredData({
      input: 'Contact: Jordan Hayes at Acme Cloud Dynamics (jordan.hayes@acmecloud.com)',
      schema: leadExtractionResultSchema,
      schemaName: 'leadExtractionSchema',
    });

    expect(result.data.leads.length).toBeGreaterThanOrEqual(1);
    expect(result.data.leads[0].companyName).toBe('Acme Cloud Dynamics');
    expect(result.data.leads[0].email).toBe('jordan.hayes@acmecloud.com');
  });

  it('AIProviderService defaults to MockAIProvider when no external keys exist', () => {
    AIProviderService.reset();
    const provider = AIProviderService.getProvider('MOCK');
    expect(provider.providerType).toBe('MOCK');
  });

  it('OpenAIProvider throws AIAuthenticationError when API key is empty', async () => {
    const provider = new OpenAIProvider('');
    await expect(
      provider.generateText({ prompt: 'test' })
    ).rejects.toThrow('OPENAI_API_KEY is not configured');
  });

  it('GeminiProvider throws AIAuthenticationError when API key is empty', async () => {
    const provider = new GeminiProvider('');
    await expect(
      provider.generateText({ prompt: 'test' })
    ).rejects.toThrow('GEMINI_API_KEY is not configured');
  });
});
