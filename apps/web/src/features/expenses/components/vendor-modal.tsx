/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

interface VendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export function VendorModal({ isOpen, onClose, onSaved }: VendorModalProps) {
  const toastCtx = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [name, setName] = React.useState('');
  const [contactPerson, setContactPerson] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [notes, setNotes] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toastCtx.error('Validation Error', 'Vendor name is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/expenses/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contactPerson, email, phone, address, notes }),
      });

      if (res.ok) {
        toastCtx.success('Vendor Saved', `Vendor "${name}" created successfully.`);
        onSaved();
        onClose();
      } else {
        const err = await res.json();
        toastCtx.error('Vendor Error', err.error || 'Failed to save vendor.');
      }
    } catch (err) {
      console.error('Vendor save error:', err);
      toastCtx.error('Error', 'Failed to save vendor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Add Vendor Profile"
      description="Create vendor record for linking company supplies, software, and external services."
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1 text-xs">
        <div>
          <label className="font-semibold text-foreground block mb-1">Vendor Name *</label>
          <Input
            placeholder="e.g. Amazon Web Services Inc."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-8.5 text-xs bg-background font-semibold"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-foreground block mb-1">Contact Person</label>
            <Input
              placeholder="e.g. John Doe"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="h-8.5 text-xs bg-background"
            />
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">Phone Number</label>
            <Input
              placeholder="+1 (800) 555-0199"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-8.5 text-xs bg-background"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-foreground block mb-1">Email Address</label>
            <Input
              placeholder="billing@aws.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-8.5 text-xs bg-background"
            />
          </div>

          <div>
            <label className="font-semibold text-foreground block mb-1">Office Address</label>
            <Input
              placeholder="Seattle, WA, USA"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-8.5 text-xs bg-background"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold text-foreground block mb-1">Internal Notes</label>
          <Textarea
            rows={2}
            placeholder="Tax ID, payment terms, account number..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="text-xs bg-background"
          />
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-8.5 text-xs">
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-8.5 text-xs gap-1.5 bg-primary text-primary-foreground font-bold"
          >
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            <span>Save Vendor</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
