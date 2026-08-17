import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getEmailEnvConfig, EmailConfigurationError } from '../env';
import { send } from '../email-service';
import { buildInvoiceEmailHtml, buildInvoiceEmailText } from '../templates/invoice';
import { buildQuotationEmailHtml, buildQuotationEmailText } from '../templates/quotation';

describe('Email Environment Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('validates RESEND_API_KEY format and returns onboarding@resend.dev default from address', () => {
    process.env.RESEND_API_KEY = 're_test_key_12345';
    delete process.env.EMAIL_FROM;

    const config = getEmailEnvConfig();
    expect(config.apiKey).toBe('re_test_key_12345');
    expect(config.fromAddress).toBe('onboarding@resend.dev');
  });

  it('trims whitespace from RESEND_API_KEY', () => {
    process.env.RESEND_API_KEY = '  re_test_key_12345  ';
    const config = getEmailEnvConfig();
    expect(config.apiKey).toBe('re_test_key_12345');
  });

  it('throws EmailConfigurationError if RESEND_API_KEY is missing', () => {
    delete process.env.RESEND_API_KEY;
    expect(() => getEmailEnvConfig()).toThrow(EmailConfigurationError);
  });

  it('throws EmailConfigurationError if RESEND_API_KEY does not start with re_', () => {
    process.env.RESEND_API_KEY = 'invalid_key';
    expect(() => getEmailEnvConfig()).toThrow(EmailConfigurationError);
  });
});

describe('Email Service Options Validation', () => {
  it('rejects sending when recipient email (to) is missing', async () => {
    const res = await send({ to: '', subject: 'Test', html: '<p>Test</p>' });
    expect(res.success).toBe(false);
    expect(res.errorCode).toBe('MISSING_TO');
  });

  it('rejects sending when subject is missing', async () => {
    const res = await send({ to: 'client@example.com', subject: '', html: '<p>Test</p>' });
    expect(res.success).toBe(false);
    expect(res.errorCode).toBe('MISSING_SUBJECT');
  });

  it('rejects sending when content is missing', async () => {
    const res = await send({ to: 'client@example.com', subject: 'Test', html: '', text: '' });
    expect(res.success).toBe(false);
    expect(res.errorCode).toBe('MISSING_CONTENT');
  });
});

describe('Invoice & Quotation Email Template Generators', () => {
  it('generates valid HTML & text for invoice emails', () => {
    const invoiceParams = {
      invoiceId: 'inv-123',
      invoiceNumber: 'INV-00100',
      invoiceDate: 'August 11, 2026',
      dueDate: 'August 25, 2026',
      customerName: 'Acme Corp',
      grandTotal: 1500.5,
      currency: 'USD',
      message: 'Please review and process invoice INV-00100.',
      to: 'billing@acme.com',
    };

    const html = buildInvoiceEmailHtml(invoiceParams);
    const text = buildInvoiceEmailText(invoiceParams);

    expect(html).toContain('INV-00100');
    expect(html).toContain('$1,500.50');
    expect(html).toContain('Acme Corp');
    expect(text).toContain('INV-00100');
    expect(text).toContain('1500.50');
  });

  it('generates valid HTML & text for quotation emails', () => {
    const quoteParams = {
      quotationId: 'qtn-456',
      quoteNumber: 'QTN-00042',
      quoteDate: 'August 11, 2026',
      expiryDate: 'September 11, 2026',
      customerName: 'Stark Industries',
      grandTotal: 5000,
      currency: 'USD',
      message: 'Please review the estimate QTN-00042.',
      to: 'pepper@stark.com',
    };

    const html = buildQuotationEmailHtml(quoteParams);
    const text = buildQuotationEmailText(quoteParams);

    expect(html).toContain('QTN-00042');
    expect(html).toContain('$5,000.00');
    expect(html).toContain('Stark Industries');
    expect(text).toContain('QTN-00042');
    expect(text).toContain('5000.00');
  });
});
