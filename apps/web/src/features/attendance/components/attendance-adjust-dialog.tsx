'use client';

import * as React from 'react';
import { AttendanceAdjustFormValues } from '../schemas/attendance-schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, X, Clock } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

interface AttendanceAdjustDialogProps {
  isOpen: boolean;
  initialUserId?: string;
  initialDate?: string;
  onClose: () => void;
  onSubmit: (values: AttendanceAdjustFormValues) => Promise<void>;
}

export function AttendanceAdjustDialog({
  isOpen,
  initialUserId,
  initialDate,
  onClose,
  onSubmit,
}: AttendanceAdjustDialogProps) {
  const { error: toastError } = useToast();

  const [userId, setUserId] = React.useState(initialUserId || 'usr_001');
  const [date, setDate] = React.useState(initialDate || new Date().toISOString().split('T')[0]);
  const [clockInTime, setClockInTime] = React.useState('09:00');
  const [clockOutTime, setClockOutTime] = React.useState('18:00');
  const [status, setStatus] = React.useState<AttendanceAdjustFormValues['status']>('PRESENT');
  const [notes, setNotes] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (initialUserId) setUserId(initialUserId);
    if (initialDate) setDate(initialDate);
    setErrorMsg(null);
  }, [initialUserId, initialDate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await onSubmit({
        userId,
        date,
        clockInTime: clockInTime || undefined,
        clockOutTime: clockOutTime || undefined,
        status,
        notes: notes || undefined,
      });
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Failed to adjust record.';
      setErrorMsg(msg);
      toastError('Adjustment Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Adjust Attendance Record</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-5 space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-destructive/15 text-destructive text-xs">
                {errorMsg}
              </div>
            )}

            {/* Employee ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Employee *</label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden"
              >
                <option value="usr_001">Alex Carter (Owner)</option>
                <option value="usr_002">Sarah Jenkins (Admin)</option>
                <option value="usr_003">Marcus Vance (Employee)</option>
                <option value="usr_004">Elena Rostova (Employee)</option>
                <option value="usr_005">Liam Chen (Employee)</option>
              </select>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Date *</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="h-8 text-xs"
              />
            </div>

            {/* Times */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Clock In Time</label>
                <Input
                  type="time"
                  value={clockInTime}
                  onChange={(e) => setClockInTime(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Clock Out Time</label>
                <Input
                  type="time"
                  value={clockOutTime}
                  onChange={(e) => setClockOutTime(e.target.value)}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Attendance Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden"
              >
                <option value="PRESENT">Present (Regularized)</option>
                <option value="LATE">Late</option>
                <option value="HALF_DAY">Half Day</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="ABSENT">Absent</option>
              </select>
            </div>

            {/* Notes / Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Adjustment Reason / Notes</label>
              <textarea
                rows={2}
                placeholder="e.g. Approved leave, biometric sync issue, manual regularization"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-background border border-border rounded-md p-2 text-xs focus:outline-hidden"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-2 px-5 py-3 border-t border-border bg-muted/20">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              <span>Save Record</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
