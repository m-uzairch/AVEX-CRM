/**
 * AVEX CRM — Employee Invitation Email Template
 *
 * Sends an invitation to a new employee with brand styling and dark‑mode support.
 */

import type { EmployeeInvitationEmailParams } from '../types';

const BRAND_GRADIENT = 'background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
const FONT_STACK = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export function buildEmployeeInvitationEmailHtml(params: EmployeeInvitationEmailParams): string {
  const { name, invitedByName, companyName, inviteUrl, expiresIn, role } = params;
  const displayName = name || 'Colleague';
  const roleInfo = role ? ` as <strong>${role}</strong>` : '';
  const expiry = expiresIn ? ` This invitation expires in ${expiresIn}.` : '';
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Invitation to join ${companyName}</title>
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
@media only screen and (max-width:600px){ .wrapper{padding:16px 8px !important;} .header,.body,.footer{padding:24px 20px !important; } }
</style>
</head>
<body>
<div class="wrapper">
<table class="container" width="600" cellpadding="0" cellspacing="0" border="0" align="center">
<tr><td class="header"><div class="header-logo">${companyName}</div></td></tr>
<tr><td class="body">
<p class="greeting">Hi <strong>${displayName}</strong>,</p>
<p>${invitedByName} has invited you to join <strong>${companyName}</strong>${roleInfo}.</p>
<p>Click the button below to accept the invitation and set up your account.</p>
<p style="text-align:center;margin:24px 0;">
<a href="${inviteUrl}" class="cta">Accept Invitation &rarr;</a>
</p>
<p>${expiry}</p>
<p>If you think this is a mistake, you can safely ignore this email.</p>
</td></tr>
<tr><td class="footer">
<p>Sent by <strong>${companyName}</strong> — Professional Business Management</p>
<p>This is an automated email. Please do not reply directly.</p>
</td></tr>
</table>
</div>
</body>
</html>`;
}

export function buildEmployeeInvitationEmailText(params: EmployeeInvitationEmailParams): string {
  const { name, invitedByName, companyName, inviteUrl, expiresIn, role } = params;
  const displayName = name || 'Colleague';
  const roleInfo = role ? ` as ${role}` : '';
  const expiry = expiresIn ? ` (expires in ${expiresIn})` : '';
  return [
    `Invitation to join ${companyName}${roleInfo}`,
    '='.repeat(50),
    `Hi ${displayName},`,
    `${invitedByName} has invited you to join ${companyName}.${expiry}`,
    'Accept the invitation using the link below:',
    inviteUrl,
    '',
    'If you think this is a mistake, you can ignore this email.',
    '',
    `Sent by ${companyName} — Professional Business Management`,
  ].join('\n');
}
