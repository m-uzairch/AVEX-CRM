'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { UserCheck, ArrowRight, Building, Mail, CheckCircle2 } from 'lucide-react';
import { Lead } from '../../types/lead-types';

interface LeadConvertModalProps {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onConfirm: (payload: { customerStatus?: string; notes?: string }) => Promise<void>;
}

export function LeadConvertModal({
  isOpen,
  lead,
  onClose,
  onConfirm,
}: LeadConvertModalProps) {
  const [customerStatus, setCustomerStatus] = React.useState('ACTIVE');
  const [notes, setNotes] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  if (!isOpen || !lead) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onConfirm({ customerStatus, notes });
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Failed to convert lead.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-card border border-border w-full max-w-lg rounded-xl shadow-2xl overflow-hidden text-card-foreground">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <UserCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Convert Lead to Customer</h2>
              <p className="text-xs text-white/80">
                Promote lead to an official customer record with full profile history.
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Summary Box */}
          <div className="bg-muted/50 border border-border/80 p-3.5 rounded-lg space-y-2">
            <div className="flex justify-between items-center text-sm font-semibold">
              <span>{lead.name}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold">
                Lead Score: {lead.score}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-1">
              <div className="flex items-center space-x-1.5 truncate">
                <Building className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{lead.companyName}</span>
              </div>
              <div className="flex items-center space-x-1.5 truncate">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{lead.email}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Customer Initial Status</label>
            <select
              value={customerStatus}
              onChange={(e) => setCustomerStatus(e.target.value)}
              className="w-full text-xs p-2 rounded-md border border-input bg-background text-foreground"
            >
              <option value="ACTIVE">Active Customer</option>
              <option value="PROSPECT">Prospect</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Conversion Notes (Internal)</label>
            <textarea
              rows={3}
              placeholder="Add key deal highlights or instructions for customer onboarding..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded-md border border-input bg-background text-foreground"
            />
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 p-3 rounded-lg flex items-start space-x-2 text-[11px]">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              The lead status will update to <strong>WON (Converted)</strong>, a Customer Account will be created, and a <strong>Project Workspace</strong> with default milestones will automatically be generated.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
            >
              {isSubmitting ? (
                <span>Converting...</span>
              ) : (
                <>
                  <span>Complete Conversion</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
