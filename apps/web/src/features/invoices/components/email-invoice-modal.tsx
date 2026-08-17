/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, X, Send, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';
import { useNotificationStore } from '@/stores/notification-store';

interface EmailInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: string;
  invoiceNumber: string;
  customerEmail?: string;
  customerName?: string;
  onEmailSent: () => void;
}

type ModalState = 'compose' | 'sending' | 'success' | 'error';

export function EmailInvoiceModal({
  isOpen,
  onClose,
  invoiceId,
  invoiceNumber,
  customerEmail = '',
  customerName = 'Valued Customer',
  onEmailSent,
}: EmailInvoiceModalProps) {
  const toastCtx = useToast();
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [recipientEmail, setRecipientEmail] = React.useState(customerEmail);
  const [subject, setSubject] = React.useState(`Invoice ${invoiceNumber} from AVEX CRM`);
  const [message, setMessage] = React.useState(
    `Dear ${customerName},\n\nPlease find your invoice ${invoiceNumber} attached. Kindly review and process the payment as per the agreed terms.\n\nThank you for your business!`
  );
  const [modalState, setModalState] = React.useState<ModalState>('compose');
  const [previewUrl, setPreviewUrl] = React.useState<string | undefined>();
  const [sentTo, setSentTo] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      setRecipientEmail(customerEmail);
      setSubject(`Invoice ${invoiceNumber} from AVEX CRM`);
      setMessage(
        `Dear ${customerName},\n\nPlease find your invoice ${invoiceNumber} attached. Kindly review and process the payment as per the agreed terms.\n\nThank you for your business!`
      );
      setModalState('compose');
      setPreviewUrl(undefined);
      setSentTo('');
      setErrorMsg('');
    }
  }, [isOpen, customerEmail, customerName, invoiceNumber]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail) {
      toastCtx.error('Validation Error', 'Please enter a recipient email address.');
      return;
    }

    setModalState('sending');
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail, subject, message }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSentTo(recipientEmail);
        setPreviewUrl(data.previewUrl);
        setModalState('success');

        // Push bell notification
        addNotification(
          `Invoice ${invoiceNumber} Emailed`,
          `Successfully sent to ${recipientEmail} via Resend Mail.`
        );

        // Toast
        toastCtx.success(
          '✉️ Email Sent',
          `Invoice ${invoiceNumber} sent to ${recipientEmail}`
        );

        onEmailSent();
      } else {
        setErrorMsg(data.error || 'Failed to send email. Please try again.');
        setModalState('error');
        toastCtx.error('Email Failed', data.error || 'Could not send the invoice email.');
      }
    } catch (err: any) {
      console.error('Email invoice error:', err);
      setErrorMsg('Network error. Please check your connection and try again.');
      setModalState('error');
      toastCtx.error('Network Error', 'Failed to reach the email server.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Mail className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground">Email Invoice</h3>
              <p className="text-[11px] text-muted-foreground font-mono">{invoiceNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-md p-1 hover:bg-accent transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* SUCCESS STATE */}
        {modalState === 'success' && (
          <div className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
              <h4 className="font-bold text-base text-foreground">Email Sent Successfully!</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Invoice <span className="font-mono font-semibold text-foreground">{invoiceNumber}</span> was delivered to:
              </p>
              <p className="text-sm font-semibold text-primary mt-1">{sentTo}</p>
            </div>
            {previewUrl && (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600 underline underline-offset-2"
              >
                <ExternalLink className="h-3 w-3" />
                Preview email in browser
              </a>
            )}
            <Button onClick={onClose} className="mt-2 h-8 text-xs px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              Done
            </Button>
          </div>
        )}

        {/* SENDING STATE */}
        {modalState === 'sending' && (
          <div className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <div>
              <h4 className="font-bold text-base text-foreground">Sending Email...</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Delivering invoice to <span className="font-semibold">{recipientEmail}</span>
              </p>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {modalState === 'error' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">Failed to Send Email</h4>
                <p className="text-xs text-muted-foreground mt-1">{errorMsg}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1 h-8 text-xs">Cancel</Button>
              <Button onClick={() => setModalState('compose')} className="flex-1 h-8 text-xs">Try Again</Button>
            </div>
          </div>
        )}

        {/* COMPOSE STATE */}
        {modalState === 'compose' && (
          <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-foreground block mb-1.5">
                Recipient Email <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="client@company.com"
                className="h-9 text-xs bg-background"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1.5">Subject</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-9 text-xs bg-background"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground block mb-1.5">Message</label>
              <Textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="text-xs bg-background resize-none"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-1 border-t border-border">
              <Button variant="outline" size="sm" type="button" onClick={onClose} className="h-8 text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5 font-semibold"
              >
                <Send className="h-3.5 w-3.5" />
                Send Email
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
