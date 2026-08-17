'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, Trash2, ArrowRight, RefreshCcw } from 'lucide-react';
import { ParsedLeadRow, DuplicateStrategy } from '../../types/import-types';

interface ImportPreviewStepProps {
  rows: ParsedLeadRow[];
  onExecuteImport: (
    rows: ParsedLeadRow[],
    duplicateStrategy: DuplicateStrategy
  ) => Promise<void>;
  onBack: () => void;
  isExecuting: boolean;
}

export function ImportPreviewStep({
  rows: initialRows = [],
  onExecuteImport,
  onBack,
  isExecuting,
}: ImportPreviewStepProps) {
  const [rows, setRows] = React.useState<ParsedLeadRow[]>(initialRows);
  const [duplicateStrategy, setDuplicateStrategy] = React.useState<DuplicateStrategy>('SKIP');

  const validCount = rows.filter((r) => r.isValid).length;
  const duplicateCount = rows.filter((r) => r.isDuplicate).length;

  const handleRowChange = (rowId: string, field: string, value: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.rowId === rowId) {
          const updated = { ...r, [field]: value };
          // Re-evaluate email validity if email changed
          if (field === 'email') {
            const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            updated.isValid = Boolean(value && updated.name && updated.companyName && isValidEmail);
            updated.validationError = isValidEmail ? undefined : 'Invalid email format';
          }
          return updated;
        }
        return r;
      })
    );
  };

  const handleRemoveRow = (rowId: string) => {
    setRows((prev) => prev.filter((r) => r.rowId !== rowId));
  };

  const handleConfirm = () => {
    onExecuteImport(rows, duplicateStrategy);
  };

  return (
    <div className="space-y-6 text-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Import Preview & Validation</h2>
          <p className="text-xs text-muted-foreground">
            Review parsed records, fix validation warnings, and select duplicate handling rules.
          </p>
        </div>

        {/* Summary stats */}
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs px-2.5 py-1">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            {validCount} Valid
          </Badge>
          {duplicateCount > 0 && (
            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs px-2.5 py-1">
              <AlertTriangle className="h-3.5 w-3.5 mr-1" />
              {duplicateCount} Duplicates
            </Badge>
          )}
        </div>
      </div>

      {/* Duplicate Strategy selector */}
      {duplicateCount > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-800 dark:text-amber-300">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
            <div>
              <p className="font-bold text-xs">Duplicate Leads Detected ({duplicateCount})</p>
              <p className="text-[11px] opacity-80">
                Choose how to handle leads that match existing records in your workspace database.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <span className="font-semibold text-[11px]">Strategy:</span>
            <select
              value={duplicateStrategy}
              onChange={(e) => setDuplicateStrategy(e.target.value as DuplicateStrategy)}
              className="text-xs p-1.5 rounded-md border border-amber-500/40 bg-card text-foreground font-semibold"
            >
              <option value="SKIP">Skip Duplicates (Default)</option>
              <option value="UPDATE">Update Existing Leads</option>
              <option value="CREATE_NEW">Create Duplicate Anyway</option>
            </select>
          </div>
        </div>
      )}

      {/* Preview Table */}
      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-semibold tracking-wider sticky top-0 bg-card">
              <tr>
                <th className="p-3 w-12 text-center">Status</th>
                <th className="p-3">Lead Name *</th>
                <th className="p-3">Company Name *</th>
                <th className="p-3">Email Address *</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Source</th>
                <th className="p-3">Industry</th>
                <th className="p-3 w-10 text-right">Remove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-medium">
              {rows.map((row) => (
                <tr
                  key={row.rowId}
                  className={`hover:bg-muted/30 transition-colors ${
                    !row.isValid
                      ? 'bg-red-500/5'
                      : row.isDuplicate
                      ? 'bg-amber-500/5'
                      : ''
                  }`}
                >
                  {/* Status Badges */}
                  <td className="p-3 text-center">
                    {!row.isValid ? (
                      <span title={row.validationError} className="inline-block p-1 rounded-full bg-red-500/10 text-red-500">
                        <AlertTriangle className="h-4 w-4" />
                      </span>
                    ) : row.isDuplicate ? (
                      <span title={row.duplicateReason} className="inline-block p-1 rounded-full bg-amber-500/10 text-amber-500">
                        <RefreshCcw className="h-4 w-4" />
                      </span>
                    ) : (
                      <span title="Valid Lead" className="inline-block p-1 rounded-full bg-emerald-500/10 text-emerald-600">
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                    )}
                  </td>

                  {/* Inline editable inputs */}
                  <td className="p-2">
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => handleRowChange(row.rowId, 'name', e.target.value)}
                      className="w-full text-xs p-1.5 rounded border border-input bg-background font-semibold"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="text"
                      value={row.companyName}
                      onChange={(e) => handleRowChange(row.rowId, 'companyName', e.target.value)}
                      className="w-full text-xs p-1.5 rounded border border-input bg-background"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="email"
                      value={row.email}
                      onChange={(e) => handleRowChange(row.rowId, 'email', e.target.value)}
                      className={`w-full text-xs p-1.5 rounded border bg-background ${
                        !row.isValid ? 'border-red-500 text-red-600' : 'border-input'
                      }`}
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="text"
                      value={row.phone}
                      onChange={(e) => handleRowChange(row.rowId, 'phone', e.target.value)}
                      className="w-full text-xs p-1.5 rounded border border-input bg-background"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="text"
                      value={row.source || ''}
                      onChange={(e) => handleRowChange(row.rowId, 'source', e.target.value)}
                      className="w-full text-xs p-1.5 rounded border border-input bg-background"
                    />
                  </td>

                  <td className="p-2">
                    <input
                      type="text"
                      value={row.industry || ''}
                      onChange={(e) => handleRowChange(row.rowId, 'industry', e.target.value)}
                      className="w-full text-xs p-1.5 rounded border border-input bg-background"
                    />
                  </td>

                  <td className="p-2 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveRow(row.rowId)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" size="sm" onClick={onBack} disabled={isExecuting}>
          Back to Mapping
        </Button>
        <Button
          size="sm"
          onClick={handleConfirm}
          disabled={isExecuting || rows.length === 0}
          className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
        >
          {isExecuting ? (
            <span>Importing Leads...</span>
          ) : (
            <>
              <span>Execute Import ({rows.length} records)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
