/**
 * AVEX CRM — PDF & Document Attachment Generator
 *
 * Generates document attachments for Invoices and Quotations.
 */

export interface PdfGenerationResult {
  buffer: Buffer;
  filename: string;
  contentType: string;
  sizeBytes: number;
}

/**
 * Generate PDF attachment for an Invoice
 */
export function generateInvoicePdf(invoice: any): PdfGenerationResult {
  const invoiceNumber = invoice.invoiceNumber || 'INV-00000';
  const filename = `Invoice_${invoiceNumber}.pdf`;
  const contentType = 'application/pdf';

  const customerName = (invoice.customer?.companyName || invoice.customer?.name || 'Valued Customer')
    .replace(/[()\\]/g, '');
  const grandTotal = Number(invoice.grandTotal || 0).toFixed(2);
  const currency = invoice.currency || 'USD';
  const dueDate = invoice.dueDate
    ? new Date(invoice.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'As per agreed terms';
  const invoiceDate = invoice.invoiceDate
    ? new Date(invoice.invoiceDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Stream payload formatting PDF 1.4
  const streamText = `BT
/F1 20 Tf
40 770 Td
(AVEX CRM - INVOICE ${invoiceNumber}) Tj
/F1 11 Tf
0 -30 Td
(Billed To: ${customerName}) Tj
0 -18 Td
(Invoice Date: ${invoiceDate}) Tj
0 -18 Td
(Due Date: ${dueDate}) Tj
/F1 14 Tf
0 -30 Td
(Total Amount Due: $${grandTotal} ${currency}) Tj
/F1 10 Tf
0 -40 Td
(Thank you for your business!) Tj
ET`;

  const pdfSource = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${Buffer.byteLength(streamText)} >>
stream
${streamText}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000340 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
420
%%EOF`;

  const buffer = Buffer.from(pdfSource, 'utf-8');
  return {
    buffer,
    filename,
    contentType,
    sizeBytes: buffer.length,
  };
}

/**
 * Generate PDF attachment for a Quotation
 */
export function generateQuotationPdf(quotation: any): PdfGenerationResult {
  const quoteNumber = quotation.quoteNumber || 'QTN-00000';
  const filename = `Quotation_${quoteNumber}.pdf`;
  const contentType = 'application/pdf';

  const customerName = (quotation.customer?.companyName || quotation.customer?.name || 'Valued Customer')
    .replace(/[()\\]/g, '');
  const grandTotal = Number(quotation.grandTotal || 0).toFixed(2);
  const currency = quotation.currency || 'USD';
  const expiryDate = quotation.expiryDate
    ? new Date(quotation.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'As per quoted terms';
  const quoteDate = quotation.quoteDate
    ? new Date(quotation.quoteDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const streamText = `BT
/F1 20 Tf
40 770 Td
(AVEX CRM - QUOTATION ESTIMATE ${quoteNumber}) Tj
/F1 11 Tf
0 -30 Td
(Prepared For: ${customerName}) Tj
0 -18 Td
(Quote Date: ${quoteDate}) Tj
0 -18 Td
(Valid Until: ${expiryDate}) Tj
/F1 14 Tf
0 -30 Td
(Quoted Total: $${grandTotal} ${currency}) Tj
/F1 10 Tf
0 -40 Td
(Thank you for considering our proposal!) Tj
ET`;

  const pdfSource = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${Buffer.byteLength(streamText)} >>
stream
${streamText}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000340 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
420
%%EOF`;

  const buffer = Buffer.from(pdfSource, 'utf-8');
  return {
    buffer,
    filename,
    contentType,
    sizeBytes: buffer.length,
  };
}
