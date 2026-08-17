/**
 * AVEX CRM — Quotation Email Template
 *
 * Responsive, email-client-safe HTML for quotation emails.
 * Includes dark-mode support and a plain‑text fallback.
 */

import type { QuotationEmailParams } from '../types';

const BRAND_PRIMARY = '#6366f1';
const BRAND_GRADIENT = 'background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
const FONT_STACK = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export function buildQuotationEmailHtml(params: QuotationEmailParams): string {
  const {
    quoteNumber,
    quoteDate,
    expiryDate,
    customerName,
    companyName,
    grandTotal,
    currency,
    message,
    quoteLink,
  } = params;

  const formattedTotal = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(grandTotal);

  const displayName = companyName ? `${customerName} — ${companyName}` : customerName;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Quotation ${quoteNumber} — AVEX CRM</title>
  <style>
    body, table, td, a { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; }
    img { -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; }
    body { margin:0 !important; padding:0 !important; background:#f1f5f9; font-family:${FONT_STACK}; }
    .wrapper { width:100%; background:#f1f5f9; padding:40px 16px; }
    .container { max-width:600px; margin:0 auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,0.08); }
    .header { ${BRAND_GRADIENT}; padding:36px 40px; }
    .header-logo { font-size:24px; font-weight:800; color:#fff; letter-spacing:-0.5px; }
    .header-sub { font-size:12px; color:rgba(255,255,255,0.75); margin-top:2px; }
    .header-badge { background:rgba(255,255,255,0.18); border-radius:8px; padding:10px 18px; text-align:right; }
    .header-badge-label { font-size:10px; color:rgba(255,255,255,0.8); text-transform:uppercase; letter-spacing:1.2px; }
    .header-badge-value { font-size:18px; font-weight:700; color:#fff; font-family:'Courier New', monospace; margin-top:2px; }
    .body-content { padding:40px; }
    .greeting { font-size:16px; color:#334155; margin:0 0 8px; }
    .greeting strong { color:#0f172a; }
    .message { font-size:14px; color:#475569; line-height:1.75; margin:0 0 32px; }
    .summary-card { background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:24px; margin-bottom:32px; }
    .summary-label { font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.8px; }
    .summary-amount { font-size:32px; font-weight:800; color:${BRAND_PRIMARY}; }
    .summary-meta { margin-top:16px; border-top:1px solid #e2e8f0; padding-top:16px; }
    .meta-row { margin-bottom:8px; }
    .meta-label { font-size:11px; color:#94a3b8; }
    .meta-value { font-size:13px; font-weight:600; color:#334155; }
    .cta-btn { display:inline-block; ${BRAND_GRADIENT}; color:#fff !important; text-decoration:none; font-size:14px; font-weight:700; padding:14px 36px; border-radius:10px; letter-spacing:0.3px; }
    .divider { border:none; border-top:1px solid #e2e8f0; margin:32px 0; }
    .footer { background:#f8fafc; border-top:1px solid #e2e8f0; padding:24px 40px; text-align:center; }
    .footer p { font-size:11px; color:#94a3b8; margin:4px 0; line-height:1.6; }
    .footer strong { color:#64748b; }
    @media (prefers-color-scheme:dark) {
      body,.wrapper{background:#0f172a!important} .container{background:#1e293b!important} .body-content{background:#1e293b!important}
      .greeting{color:#e2e8f0!important} .greeting strong{color:#f8fafc!important} .message{color:#94a3b8!important}
      .summary-card{background:#0f172a!important;border-color:#334155!important} .summary-label{color:#64748b!important}
      .meta-label{color:#475569!important} .meta-value{color:#cbd5e1!important}
      .footer{background:#0f172a!important;border-color:#1e293b!important} .footer p{color:#475569!important}
    }
    @media only screen and (max-width:600px){
      .wrapper{padding:16px 8px!important} .header,.body-content,.footer{padding:24px 20px!important}
      .header-table{display:block!important} .header-badge{display:block!important;margin-top:16px!important;text-align:left!important}
      .summary-amount{font-size:24px!important}
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <table class="container" width="600" cellpadding="0" cellspacing="0" border="0" align="center">
      <tr><td class="header">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="vertical-align:top;">
              <div class="header-logo">AVEX CRM</div>
              <div class="header-sub">Professional Quotation</div>
            </td>
            <td style="vertical-align:top;text-align:right;">
              <div class="header-badge">
                <div class="header-badge-label">Quote No.</div>
                <div class="header-badge-value">${quoteNumber}</div>
              </div>
            </td>
          </tr>
        </table>
      </td></tr>
      <tr><td class="body-content">
        <p class="greeting">Dear <strong>${displayName}</strong>,</p>
        <p class="message">${message.replace(/\n/g, '<br />')}</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;margin-bottom:32px;">
          <tr><td style="padding:24px;">
            <div style="font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;">Amount</div>
            <div style="font-size:32px;font-weight:800;color:${BRAND_PRIMARY};margin-top:4px;">${formattedTotal}</div>
            <div style="margin-top:16px;padding-top:16px;border-top:1px solid #e2e8f0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:12px;">
                <tr>
                  <td style="padding:4px 0;">
                    <span style="font-size:11px;color:#94a3b8;">Quote Date</span><br/>
                    <span style="font-size:13px;font-weight:600;color:#334155;">${quoteDate}</span>
                  </td>
                  <td style="padding:4px 0;text-align:right;">
                    <span style="font-size:11px;color:#94a3b8;">Expires</span><br/>
                    <span style="font-size:13px;font-weight:700;color:#dc2626;">${expiryDate}</span>
                  </td>
                </tr>
              </table>
            </div>
          </td></tr>
        </table>
        ${quoteLink ? `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
          <tr><td align="center">
            <a href="${quoteLink}" class="cta-btn" style="display:inline-block;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 36px;border-radius:10px;">
              View Quotation &rarr;
            </a>
          </td></tr>
        </table>` : ''}
        <hr class="divider" />
        <p style="font-size:12px;color:#94a3b8;margin:0;line-height:1.6;">
          If you have any questions about this quotation, feel free to reply to this email.
        </p>
      </td></tr>
      <tr><td class="footer">
        <p>Sent by <strong>AVEX CRM</strong> — Professional Business Management</p>
        <p>This is an automated email. Please do not reply directly.</p>
      </td></tr>
    </table>
  </div>
</body>
</html>`;
}

export function buildQuotationEmailText(params: QuotationEmailParams): string {
  const { quoteNumber, quoteDate, expiryDate, customerName, grandTotal, currency, message, quoteLink } = params;
  const formattedTotal = `${currency} ${grandTotal.toFixed(2)}`;
  return [
    `AVEX CRM — Quotation ${quoteNumber}`,
    '='.repeat(50),
    '',
    `Dear ${customerName},`,
    '',
    message,
    '',
    '─'.repeat(40),
    `Amount:        ${formattedTotal}`,
    `Quote Date:    ${quoteDate}`,
    `Expiry Date:   ${expiryDate}`,
    '─'.repeat(40),
    quoteLink ? `View Quotation: ${quoteLink}` : '',
    '',
    'If you have any questions, please reply to this email.',
    '',
    'Sent by AVEX CRM — Professional Business Management',
  ]
    .filter(Boolean)
    .join('\n');
}
