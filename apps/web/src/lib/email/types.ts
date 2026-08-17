/**
 * AVEX CRM — Email Service Types
 *
 * All type definitions for the Resend-based Email Service.
 * Import from here — never from individual template files.
 */

// ─── Core Send Options ──────────────────────────────────────────────────────

export interface EmailAttachment {
  /** Filename shown to recipient (e.g. "Invoice_INV-000001.html") */
  filename: string;
  /** Raw file content as a Buffer or base64 string */
  content: Buffer | string;
  /** MIME type (e.g. "text/html", "application/pdf") */
  contentType: string;
}

export interface SendEmailOptions {
  /** Recipient email address */
  to: string | string[];
  /** Email subject line */
  subject: string;
  /** HTML body */
  html: string;
  /** Plain-text fallback (auto-generated from HTML if omitted) */
  text?: string;
  /** Override the default FROM address */
  from?: string;
  /** Reply-to address */
  replyTo?: string;
  /** CC recipients */
  cc?: string | string[];
  /** BCC recipients */
  bcc?: string | string[];
}

export interface SendEmailWithAttachmentOptions extends SendEmailOptions {
  /** Files to attach */
  attachments: EmailAttachment[];
}

// ─── Email Result ────────────────────────────────────────────────────────────

export interface EmailResult {
  success: boolean;
  /** Resend message ID (present on success) */
  messageId?: string;
  /** Human-friendly error message (present on failure) */
  error?: string;
  /** Machine error code for programmatic handling */
  errorCode?: string;
}

// ─── Invoice Email ───────────────────────────────────────────────────────────

export interface InvoiceEmailParams {
  /** Invoice database ID */
  invoiceId: string;
  /** Display invoice number (e.g. INV-000042) */
  invoiceNumber: string;
  /** Invoice date (display string) */
  invoiceDate: string;
  /** Due date (display string) */
  dueDate: string;
  /** Customer name */
  customerName: string;
  /** Company name (optional) */
  companyName?: string;
  /** Grand total amount */
  grandTotal: number;
  /** Currency code (e.g. USD) */
  currency: string;
  /** Custom message body */
  message: string;
  /** Recipient email */
  to: string;
  /** Email subject (optional override) */
  subject?: string;
  /** Link to view invoice online */
  invoiceLink?: string;
  /** Raw HTML content to attach as invoice document */
  attachmentContent?: Buffer | string;
  /** Sender info for logging */
  senderCompanyId?: string;
  senderUserId?: string;
}

// ─── Quotation Email ─────────────────────────────────────────────────────────

export interface QuotationEmailParams {
  /** Quotation database ID */
  quotationId: string;
  /** Display quote number (e.g. QTN-000007) */
  quoteNumber: string;
  /** Quote date (display string) */
  quoteDate: string;
  /** Expiry date (display string) */
  expiryDate: string;
  /** Customer name */
  customerName: string;
  /** Company name (optional) */
  companyName?: string;
  /** Grand total amount */
  grandTotal: number;
  /** Currency code */
  currency: string;
  /** Custom message body */
  message: string;
  /** Recipient email */
  to: string;
  /** Email subject (optional override) */
  subject?: string;
  /** Link to review quotation online */
  quoteLink?: string;
  /** Raw HTML content to attach as quotation document */
  attachmentContent?: Buffer | string;
  /** Sender info for logging */
  senderCompanyId?: string;
  senderUserId?: string;
}

// ─── Template Param Types ────────────────────────────────────────────────────

export interface WelcomeEmailParams {
  /** Recipient's full name */
  name: string;
  /** Recipient email */
  to: string;
  /** Link to log in / get started */
  loginUrl: string;
  /** Company / workspace name */
  workspaceName?: string;
}

export interface PasswordResetEmailParams {
  /** Recipient's full name */
  name: string;
  /** Recipient email */
  to: string;
  /** Password reset link */
  resetUrl: string;
  /** Expiry duration (e.g. "1 hour") */
  expiresIn?: string;
}

export interface EmployeeInvitationEmailParams {
  /** Invitee's name (if known) */
  name?: string;
  /** Recipient email */
  to: string;
  /** Name of the person who sent the invite */
  invitedByName: string;
  /** Company / workspace name */
  companyName: string;
  /** Invitation acceptance link */
  inviteUrl: string;
  /** Expiry duration (e.g. "7 days") */
  expiresIn?: string;
  /** Role being assigned */
  role?: string;
}

export interface MeetingReminderEmailParams {
  /** Attendee's name */
  name: string;
  /** Recipient email */
  to: string;
  /** Meeting title */
  meetingTitle: string;
  /** Meeting date + time (display string) */
  meetingDateTime: string;
  /** Meeting location or video link */
  location?: string;
  /** Meeting join link */
  meetingUrl?: string;
  /** Organizer name */
  organizerName?: string;
  /** Meeting agenda (optional) */
  agenda?: string;
}

export interface PaymentReminderEmailParams {
  /** Customer name */
  customerName: string;
  /** Recipient email */
  to: string;
  /** Invoice number */
  invoiceNumber: string;
  /** Amount due */
  amountDue: number;
  /** Currency code */
  currency: string;
  /** Due date (display string) */
  dueDate: string;
  /** Days overdue (0 = due today) */
  daysOverdue?: number;
  /** Payment link */
  paymentUrl?: string;
  /** Company name */
  companyName?: string;
}
