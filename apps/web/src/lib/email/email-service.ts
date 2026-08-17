// src/lib/email/email-service.ts
/**
 * AVEX CRM – Central Email Service (Resend SDK based)
 *
 * All email‑sending logic lives in this file. API routes import the service
 * and call the high‑level methods (`sendInvoiceEmail`, `sendQuotationEmail`,
 * `send`, `sendWithAttachment`). No route touches the Resend client directly.
 */

import { Resend } from 'resend';
import { logger } from '@/lib/logger';
import { getEmailEnvConfig } from '@/lib/email/env';
import {
  SendEmailOptions,
  SendEmailWithAttachmentOptions,
  EmailResult,
  InvoiceEmailParams,
  QuotationEmailParams,
} from '@/lib/email/types';
import { buildInvoiceEmailHtml, buildInvoiceEmailText } from '@/lib/email/templates/invoice';
import { buildQuotationEmailHtml, buildQuotationEmailText } from '@/lib/email/templates/quotation';

export { buildInvoiceEmailHtml, buildInvoiceEmailText, buildQuotationEmailHtml, buildQuotationEmailText };

/**
 * Lazy‑instantiated Resend client. The client is only created the first time an
 * email is sent, after the environment has been validated.
 */
let resendClient: Resend | null = null;
function getClient(): Resend {
  if (!resendClient) {
    const { apiKey } = getEmailEnvConfig();
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

/**
 * Core low‑level send – wraps Resend's `emails.send` call and normalises the
 * result into our `EmailResult` shape.
 */
async function coreSend(options: SendEmailOptions): Promise<EmailResult> {
  try {
    const client = getClient();
    const { fromAddress } = getEmailEnvConfig();
    const from = options.from || fromAddress;

    const response = await client.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      cc: options.cc,
      bcc: options.bcc,
    });
    // Resend returns `{ id: string }` on success.
    if ((response as any).data?.id) {
      return { success: true, messageId: (response as any).data.id };
    }
    if ((response as any).id) {
      return { success: true, messageId: (response as any).id };
    }
    if ((response as any).error) {
      const err = (response as any).error;
      return {
        success: false,
        error: err.message || 'Failed to send email via Resend',
        errorCode: err.name || 'RESEND_ERROR',
      };
    }
    // Defensive: any non‑error response without an id is treated as failure.
    return { success: false, error: 'Unexpected response from Resend', errorCode: 'UNKNOWN_RESPONSE' };
  } catch (err: any) {
    // Resend throws an error object with `statusCode` and `message`.
    const errorMessage = err?.message ?? 'Failed to send email via Resend';
    const errorCode = err?.name ?? 'RESEND_ERROR';
    logger.error({ err }, `[EmailService] Resend send error: ${errorMessage}`);
    return { success: false, error: errorMessage, errorCode };
  }
}

/**
 * Send email with binary attachment(s).
 */
async function coreSendWithAttachment(
  options: SendEmailWithAttachmentOptions
): Promise<EmailResult> {
  try {
    const client = getClient();
    const { fromAddress } = getEmailEnvConfig();
    const from = options.from || fromAddress;

    // Resend expects attachments in the "attachments" field with base64 data.
    const attachments = options.attachments.map((att) => ({
      filename: att.filename,
      content: Buffer.isBuffer(att.content) ? att.content.toString('base64') : att.content,
      type: att.contentType,
    }));
    const response = await client.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments,
      replyTo: options.replyTo,
      cc: options.cc,
      bcc: options.bcc,
    });
    if ((response as any).data?.id) {
      return { success: true, messageId: (response as any).data.id };
    }
    if ((response as any).id) {
      return { success: true, messageId: (response as any).id };
    }
    if ((response as any).error) {
      const err = (response as any).error;
      return {
        success: false,
        error: err.message || 'Failed to send email with attachment via Resend',
        errorCode: err.name || 'RESEND_ERROR',
      };
    }
    return { success: false, error: 'Unexpected response from Resend', errorCode: 'UNKNOWN_RESPONSE' };
  } catch (err: any) {
    const errorMessage = err?.message ?? 'Failed to send email with attachment via Resend';
    const errorCode = err?.name ?? 'RESEND_ERROR';
    logger.error({ err }, `[EmailService] Resend attachment error: ${errorMessage}`);
    return { success: false, error: errorMessage, errorCode };
  }
}

/**
 * Public API – send a plain email (HTML + optional text fallback).
 */
export async function send(options: SendEmailOptions): Promise<EmailResult> {
  // Validation – only basic sanity checks (email format) to avoid deep libs.
  if (!options.to) {
    return { success: false, error: 'Recipient email required', errorCode: 'MISSING_TO' };
  }
  if (!options.subject) {
    return { success: false, error: 'Email subject required', errorCode: 'MISSING_SUBJECT' };
  }
  // Ensure we have at least one content format.
  if (!options.html && !options.text) {
    return { success: false, error: 'Either html or text content must be provided', errorCode: 'MISSING_CONTENT' };
  }
  return coreSend(options);
}

/** Alias for send for backwards compatibility with API route imports */
export const sendEmail = send;

/**
 * Public API – send email with one or more attachments.
 */
export async function sendWithAttachment(
  options: SendEmailWithAttachmentOptions
): Promise<EmailResult> {
  if (!options.attachments || options.attachments.length === 0) {
    return { success: false, error: 'At least one attachment required', errorCode: 'MISSING_ATTACHMENT' };
  }
  return coreSendWithAttachment(options);
}

/**
 * Helper – compose and send an invoice email.
 */
export async function sendInvoiceEmail(params: InvoiceEmailParams): Promise<EmailResult> {
  const html = buildInvoiceEmailHtml(params);
  const text = buildInvoiceEmailText(params);
  const attachments = params.attachmentContent
    ? [
        {
          filename: `Invoice_${params.invoiceNumber}.html`,
          content: params.attachmentContent,
          contentType: 'text/html',
        },
      ]
    : [];

  const envConfig = getEmailEnvConfig();
  const base: SendEmailOptions = {
    to: params.to,
    subject: params.subject || `Invoice ${params.invoiceNumber} – AVEX CRM`,
    html,
    text,
    from: envConfig.fromAddress,
  };

  if (attachments.length) {
    return sendWithAttachment({ ...base, attachments } as any);
  }
  return send(base);
}

/**
 * Helper – compose and send a quotation email.
 */
export async function sendQuotationEmail(params: QuotationEmailParams): Promise<EmailResult> {
  const html = buildQuotationEmailHtml(params);
  const text = buildQuotationEmailText(params);
  const attachments = params.attachmentContent
    ? [
        {
          filename: `Quotation_${params.quoteNumber}.html`,
          content: params.attachmentContent,
          contentType: 'text/html',
        },
      ]
    : [];

  const envConfig = getEmailEnvConfig();
  const base: SendEmailOptions = {
    to: params.to,
    subject: params.subject || `Quotation ${params.quoteNumber} – AVEX CRM`,
    html,
    text,
    from: envConfig.fromAddress,
  };

  if (attachments.length) {
    return sendWithAttachment({ ...base, attachments } as any);
  }
  return send(base);
}

/**
 * Export the service as a class for consistency with existing services.
 */
export class EmailService {
  static async send(options: SendEmailOptions) {
    return send(options);
  }
  static async sendWithAttachment(options: SendEmailWithAttachmentOptions) {
    return sendWithAttachment(options);
  }
  static async sendInvoiceEmail(params: InvoiceEmailParams) {
    return sendInvoiceEmail(params);
  }
  static async sendQuotationEmail(params: QuotationEmailParams) {
    return sendQuotationEmail(params);
  }
}
