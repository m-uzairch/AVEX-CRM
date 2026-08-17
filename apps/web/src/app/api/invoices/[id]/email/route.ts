/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { InvoiceService } from '@/features/invoices/services/invoice-service';
import { sendWithAttachment, buildInvoiceEmailHtml } from '@/lib/email/email-service';
import { generateInvoicePdf } from '@/lib/pdf/pdf-generator';
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
      console.error('[API POST /api/invoices/[id]/email] Error: Recipient email is required');
      return NextResponse.json({ error: 'Recipient email is required.' }, { status: 400 });
    }

    // 2. API ROUTE & PAYLOAD LOGGING
    console.log('[API ROUTE INVOICE EMAIL] Request received:', {
      invoiceId: id,
      recipientEmail,
      subject: subject || 'Default Invoice Subject',
      messageLength: message?.length || 0,
    });

    // 3. DATABASE VERIFICATION (Strict lookup — no silent fallback mock records)
    const db = prisma as any;
    let invoice: any = null;

    try {
      if (db.invoice?.findUnique) {
        invoice = await db.invoice.findUnique({
          where: { id },
          include: { customer: true, items: true },
        });
      }
    } catch (dbErr: any) {
      console.error('[API ROUTE INVOICE EMAIL] DB Query Error:', dbErr);
    }

    // Fallback lookup via InvoiceService if Prisma direct query returned null
    if (!invoice) {
      try {
        invoice = await InvoiceService.getInvoiceById(id);
      } catch (err) {
        console.error('[API ROUTE INVOICE EMAIL] Invoice Not Found in DB:', err);
      }
    }

    if (!invoice || !invoice.id) {
      console.error(`[API ROUTE INVOICE EMAIL] Invoice record ${id} not found in database.`);
      return NextResponse.json(
        { error: `Invoice ID "${id}" was not found in the database.` },
        { status: 404 }
      );
    }

    const invoiceNumber = invoice.invoiceNumber || id;
    const customerName = invoice.customer?.companyName || invoice.customer?.name || body.customerName || 'Valued Client';
    const companyId = invoice.companyId || 'comp_001';
    const grandTotal = Number(invoice.grandTotal) || 0;
    const currency = invoice.currency || 'USD';

    console.log('[DATABASE VERIFICATION]', {
      invoiceExists: true,
      invoiceId: invoice.id,
      invoiceNumber,
      companyId,
      customerId: invoice.customerId,
      customerName,
      customerEmail: invoice.customer?.email || recipientEmail,
    });

    const dueDate = invoice.dueDate
      ? new Date(invoice.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : 'As per agreed terms';

    const invoiceDate = invoice.invoiceDate
      ? new Date(invoice.invoiceDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 4. PDF GENERATION & VERIFICATION
    console.log(`[PDF GENERATION] PDF generation started for Invoice ${invoiceNumber}`);
    let pdfResult;
    try {
      pdfResult = generateInvoicePdf(invoice);
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
    const html = buildInvoiceEmailHtml({
      invoiceId: invoice.id,
      invoiceNumber,
      invoiceDate,
      customerName,
      grandTotal,
      currency,
      dueDate,
      message: message || `Please find your invoice ${invoiceNumber} attached for review and payment.`,
      to: recipientEmail,
      invoiceLink: `${baseUrl}/api/invoices/${invoice.id}/pdf`,
    });

    // 5. RESEND EMAIL SENDING
    console.log('Sending email through Resend');

    const emailResult = await sendWithAttachment({
      to: recipientEmail,
      subject: subject || `Invoice ${invoiceNumber} from AVEX CRM`,
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
          error: emailResult.error || 'Failed to send invoice email via Resend.',
          errorCode: emailResult.errorCode || 'RESEND_ERROR',
        },
        { status: 400 }
      );
    }

    // Update invoice status and activity log via service
    try {
      await InvoiceService.emailInvoice(id, { recipientEmail, subject, message });
    } catch (serviceErr) {
      console.warn('[API ROUTE INVOICE EMAIL] Notice during invoice status update:', serviceErr);
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
    console.error('[API POST /api/invoices/[id]/email] Unhandled Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to email invoice.' },
      { status: 400 }
    );
  }
}
