/**
 * AVEX CRM — Welcome Email Template
 *
 * Simple onboarding email with brand styling. Includes dark‑mode support.
 */

import type { WelcomeEmailParams } from '../types';

const BRAND_GRADIENT = 'background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
const FONT_STACK = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export function buildWelcomeEmailHtml(params: WelcomeEmailParams): string {
  const { name, loginUrl, workspaceName } = params;
  const workspace = workspaceName || 'AVEX CRM';
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Welcome to ${workspace}</title>
<style>
body,table,td,a{ -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
table,td{ mso-table-lspace:0pt; mso-table-rspace:0pt; }
img{ -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; }
body{ margin:0 !important; padding:0 !important; background:#f1f5f9; font-family:${FONT_STACK}; }
.wrapper{ width:100%; background:#f1f5f9; padding:40px 16px; }
.container{ max-width:600px; margin:0 auto; background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 8px 32px rgba(0,0,0,0.08); }
.header{ ${BRAND_GRADIENT}; padding:36px 40px; }
.header-logo{ font-size:24px; font-weight:800; color:#fff; letter-spacing:-0.5px; }
.body{ padding:40px; }
.greeting{ font-size:16px; color:#334155; margin:0 0 12px; }
.greeting strong{ color:#0f172a; }
.cta{ display:inline-block; ${BRAND_GRADIENT}; color:#fff !important; text-decoration:none; font-size:14px; font-weight:700; padding:14px 36px; border-radius:10px; }
.footer{ background:#f8fafc; border-top:1px solid #e2e8f0; padding:24px 40px; text-align:center; font-size:11px; color:#94a3b8; }
@media (prefers-color-scheme:dark){ body{background:#0f172a !important;} .container{background:#1e293b !important;} .footer{background:#0f172a !important; border-color:#1e293b !important;} }
@media only screen and (max-width:600px){ .wrapper{padding:16px 8px !important;} .header,.body,.footer{padding:24px 20px !important;} }
</style>
</head>
<body>
<div class="wrapper">
<table class="container" width="600" cellpadding="0" cellspacing="0" border="0" align="center">
<tr><td class="header"><div class="header-logo">${workspace}</div></td></tr>
<tr><td class="body">
<p class="greeting">Hi <strong>${name}</strong>,</p>
<p>Welcome to <strong>${workspace}</strong>! We're excited to have you on board.</p>
<p>Get started by clicking the button below to log in to your new account.</p>
<p style="text-align:center;margin:24px 0;">
<a href="${loginUrl}" class="cta">Log In &rarr;</a>
</p>
<p>If you have any questions, feel free to reply to this email.</p>
</td></tr>
<tr><td class="footer">
<p>Sent by <strong>${workspace}</strong> — Professional Business Management</p>
<p>This is an automated email. Please do not reply directly.</p>
</td></tr>
</table>
</div>
</body>
</html>`;
}

export function buildWelcomeEmailText(params: WelcomeEmailParams): string {
  const { name, loginUrl, workspaceName } = params;
  const workspace = workspaceName || 'AVEX CRM';
  return [
    `Welcome to ${workspace}!`,
    '='.repeat(40),
    `Hi ${name},`,
    '',
    `Welcome to ${workspace}. Click the link below to log in:`,
    loginUrl,
    '',
    'If you have any questions, reply to this email.',
    '',
    `Sent by ${workspace} — Professional Business Management`,
  ].join('\n');
}
