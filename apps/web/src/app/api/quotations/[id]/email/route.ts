/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { QuotationService } from '@/features/quotations/services/quotation-service';
import { sendWithAttachment, buildQuotationEmailHtml } from '@/lib/email/email-service';
import { generateQuotationPdf } from '@/lib/pdf/pdf-generator';
import { prisma } from '@/lib/database/prisma';

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await props.params;
    const body = await request.json();
    const { recipientEmail, subject, message } = body;

    // 1. ENVIRONMENT VARIABLES VERIFICATION
    console.log('[ENV CHECK]', {
      RESEND_API_KEY: process.env.RESEND_API_KEY ? 'configured' : 'missing',
      EMAIL_FROM: process.env.EMAIL_FROM ? 'configured' : 'missing',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    });

    if (!recipientEmail) {
      console.error('[API POST /api/quotations/[id]/email] Error: Recipient email is required');
      return NextResponse.json({ error: 'Recipient email is required.' }, { status: 400 });
    }

    // 2. API ROUTE & PAYLOAD LOGGING
    console.log('[API ROUTE QUOTATION EMAIL] Request received:', {
      quotationId: id,
      recipientEmail,
      subject: subject || 'Default Quotation Subject',
      messageLength: message?.length || 0,
    });

    // 3. DATABASE VERIFICATION (Strict lookup — no silent fallback mock records)
    const db = prisma as any;
    let quotation: any = null;

    try {
      if (db.quotation?.findUnique) {
        quotation = await db.quotation.findUnique({
          where: { id },
          include: { customer: true, items: true },
        });
      }
    } catch (dbErr: any) {
      console.error('[API ROUTE QUOTATION EMAIL] DB Query Error:', dbErr);
    }

    // Fallback lookup via QuotationService if Prisma direct query returned null
    if (!quotation) {
      try {
        quotation = await QuotationService.getQuotationById(id);
      } catch (err) {
        console.error('[API ROUTE QUOTATION EMAIL] Quotation Not Found in DB:', err);
      }
    }

    if (!quotation || !quotation.id) {
      console.error(`[API ROUTE QUOTATION EMAIL] Quotation record ${id} not found in database.`);
      return NextResponse.json(
        { error: `Quotation ID "${id}" was not found in the database.` },
        { status: 404 }
      );
    }

    const quoteNumber = quotation.quoteNumber || id;
    const customerName = quotation.customer?.companyName || quotation.customer?.name || body.customerName || 'Valued Client';
    const companyId = quotation.companyId || 'comp_001';
    const grandTotal = Number(quotation.grandTotal) || 0;
    const currency = quotation.currency || 'USD';

    console.log('[DATABASE VERIFICATION]', {
      quotationExists: true,
      quotationId: quotation.id,
      quoteNumber,
      companyId,
      customerId: quotation.customerId,
      customerName,
      customerEmail: quotation.customer?.email || recipientEmail,
    });

    const expiryDate = quotation.expiryDate
      ? new Date(quotation.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'As per quoted terms';

    const quoteDate = quotation.quoteDate
      ? new Date(quotation.quoteDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 4. PDF GENERATION & VERIFICATION
    console.log(`[PDF GENERATION] PDF generation started for Quotation ${quoteNumber}`);
    let pdfResult;
    try {
      pdfResult = generateQuotationPdf(quotation);
      console.log(`[PDF GENERATION] PDF generation completed`, {
        filename: pdfResult.filename,
        sizeBytes: pdfResult.sizeBytes,
        contentType: pdfResult.contentType,
      });
    } catch (pdfErr: any) {
      console.error('[PDF GENERATION FAILED]:', pdfErr);
      return NextResponse.json(
        { error: `PDF attachment generation failed: ${pdfErr?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Build professional HTML email body
    const html = buildQuotationEmailHtml({
      quotationId: quotation.id,
      quoteNumber,
      quoteDate,
      customerName,
      grandTotal,
      currency,
      expiryDate,
      message: message || `Please find your quotation ${quoteNumber} attached for review and approval.`,
      to: recipientEmail,
      quoteLink: `${baseUrl}/api/quotations/${quotation.id}/pdf`,
    });

    // 5. RESEND EMAIL SENDING
    console.log('Sending email through Resend');

    const emailResult = await sendWithAttachment({
      to: recipientEmail,
      subject: subject || `Quotation ${quoteNumber} from AVEX CRM`,
      html,
      attachments: [
        {
          filename: pdfResult.filename,
          content: pdfResult.buffer,
          contentType: pdfResult.contentType,
        },
      ],
    });

    console.log('[RESEND RESULT]', {
      success: emailResult.success,
      resendEmailId: emailResult.messageId || null,
      resendError: emailResult.error || null,
      errorCode: emailResult.errorCode || null,
    });

    // 10. DO NOT HIDE ERRORS — Return actual failure if Resend fails
    if (!emailResult.success) {
      return NextResponse.json(
        {
          error: emailResult.error || 'Failed to send quotation email via Resend.',
          errorCode: emailResult.errorCode || 'RESEND_ERROR',
        },
        { status: 400 }
      );
    }

    // Update quotation status and activity log via service
    try {
      await QuotationService.emailQuotation(id, { recipientEmail, subject, message });
    } catch (serviceErr) {
      console.warn('[API ROUTE QUOTATION EMAIL] Notice during quotation status update:', serviceErr);
    }

    return NextResponse.json({
      success: true,
      sentAt: new Date().toISOString(),
      messageId: emailResult.messageId,
      mode: 'resend',
      pdf: {
        filename: pdfResult.filename,
        sizeBytes: pdfResult.sizeBytes,
      },
    });
  } catch (error: any) {
    console.error('[API POST /api/quotations/[id]/email] Unhandled Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to email quotation.' },
      { status: 400 }
    );
  }
}
