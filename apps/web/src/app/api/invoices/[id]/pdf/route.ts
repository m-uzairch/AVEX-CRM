/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { InvoiceService } from '@/features/invoices/services/invoice-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get('download') === 'true';
    const isPrint = searchParams.get('print') === 'true';

    const invoice = await InvoiceService.getInvoiceById(id);
    const customer = invoice.customer || { name: 'Valued Client', companyName: 'Client Company', email: '' };

    const itemsHtml = (invoice.items || []).map((item) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px; text-align: left; font-weight: 500; color: #1e293b;">
          ${item.name}
          ${item.description ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">${item.description}</div>` : ''}
        </td>
        <td style="padding: 12px; text-align: center; color: #334155;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right; color: #334155;">$${Number(item.unitPrice).toFixed(2)}</td>
        <td style="padding: 12px; text-align: right; color: #334155;">${item.discountRate}%</td>
        <td style="padding: 12px; text-align: right; color: #334155;">${item.taxRate}%</td>
        <td style="padding: 12px; text-align: right; font-weight: 600; color: #0f172a;">$${Number(item.lineTotal).toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoice.invoiceNumber} - AVEX CRM</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 40px; background: #ffffff; }
    .invoice-card { max-width: 800px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: 800; color: #0284c7; letter-spacing: -0.5px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; background: #e0f2fe; color: #0369a1; }
    .grid { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .col { width: 48%; }
    .label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
    .value { font-size: 14px; color: #1e293b; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #f8fafc; padding: 10px 12px; font-size: 11px; text-transform: uppercase; color: #475569; font-weight: 700; border-bottom: 1px solid #cbd5e1; }
    .totals { width: 300px; margin-left: auto; border-top: 1px solid #e2e8f0; padding-top: 12px; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #334155; }
    .grand-total { display: flex; justify-content: space-between; padding: 10px 0; font-size: 16px; font-weight: 800; color: #0284c7; border-top: 2px solid #0284c7; margin-top: 8px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; }
    @media print {
      body { padding: 0; }
      .invoice-card { border: none; box-shadow: none; padding: 0; }
    }
  </style>
  <script>
    window.onload = function() {
      if (${isPrint ? 'true' : 'false'}) {
        window.print();
      }
    };
  </script>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="logo">AVEX CRM</div>
        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Enterprise Financial Management</div>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 20px; font-weight: 800; color: #0f172a;">INVOICE</div>
        <div style="font-size: 13px; font-weight: 600; color: #0284c7;">${invoice.invoiceNumber}</div>
        <div style="margin-top: 6px;"><span class="badge">${invoice.status}</span></div>
      </div>
    </div>

    <div class="grid">
      <div class="col">
        <div class="label">Billed To</div>
        <div class="value" style="font-weight: 700;">${customer.companyName || customer.name}</div>
        <div class="value">${customer.name}</div>
        <div class="value" style="color: #64748b;">${customer.email || ''}</div>
      </div>
      <div class="col" style="text-align: right;">
        <div class="label">Invoice Date</div>
        <div class="value">${new Date(invoice.invoiceDate).toLocaleDateString()}</div>
        <div class="label" style="margin-top: 8px;">Due Date</div>
        <div class="value" style="color: #e11d48;">${new Date(invoice.dueDate).toLocaleDateString()}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="text-align: left;">Item Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Discount</th>
          <th style="text-align: right;">Tax</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="totals">
      <div class="total-row">
        <span>Subtotal:</span>
        <span>$${invoice.subtotal.toFixed(2)}</span>
      </div>
      <div class="total-row">
        <span>Discount:</span>
        <span style="color: #e11d48;">-$${invoice.discountAmount.toFixed(2)}</span>
      </div>
      <div class="total-row">
        <span>Tax Amount:</span>
        <span>+$${invoice.taxAmount.toFixed(2)}</span>
      </div>
      <div class="grand-total">
        <span>Grand Total:</span>
        <span>$${invoice.grandTotal.toFixed(2)} ${invoice.currency}</span>
      </div>
    </div>

    ${invoice.notes ? `
      <div class="footer">
        <div style="font-weight: 700; color: #334155; margin-bottom: 4px;">Notes & Remarks:</div>
        <div>${invoice.notes}</div>
      </div>
    ` : ''}

    ${invoice.termsConditions ? `
      <div class="footer" style="margin-top: 16px;">
        <div style="font-weight: 700; color: #334155; margin-bottom: 4px;">Terms & Conditions:</div>
        <div>${invoice.termsConditions}</div>
      </div>
    ` : ''}
  </div>
</body>
</html>`;

    const headers: Record<string, string> = {
      'Content-Type': 'text/html; charset=utf-8',
    };

    if (isDownload) {
      headers['Content-Disposition'] = `attachment; filename="Invoice_${invoice.invoiceNumber}.html"`;
    }

    return new NextResponse(htmlContent, { status: 200, headers });
  } catch (error: any) {
    console.error('[API GET /api/invoices/[id]/pdf] Error:', error);
    const status = error?.message?.includes('not found') ? 404 : 500;
    return NextResponse.json({ error: error?.message || 'Failed to render PDF document.' }, { status });
  }
}
