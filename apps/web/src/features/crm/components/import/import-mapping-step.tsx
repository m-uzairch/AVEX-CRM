'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Check } from 'lucide-react';
import { FieldMappingItem } from '../../types/import-types';
import { availableCrmFields } from '../../services/import-service';

interface ImportMappingStepProps {
  mapping: FieldMappingItem[];
  onConfirmMapping: (updatedMapping: FieldMappingItem[]) => void;
  onBack: () => void;
}

export function ImportMappingStep({
  mapping: initialMapping = [],
  onConfirmMapping,
  onBack,
}: ImportMappingStepProps) {
  const [currentMapping, setCurrentMapping] = React.useState<FieldMappingItem[]>(initialMapping);

  const handleFieldChange = (fileColumn: string, crmField: string) => {
    setCurrentMapping((prev) =>
      prev.map((item) => (item.fileColumn === fileColumn ? { ...item, crmField } : item))
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-xs">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 font-semibold text-[11px] mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Auto-Detected Field Mapping</span>
        </div>
        <h2 className="text-lg font-bold text-foreground">Review & Confirm Field Mapping</h2>
        <p className="text-xs text-muted-foreground">
          Map extracted document columns to corresponding AVEX CRM Lead properties.
        </p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
            <tr>
              <th className="p-3">Source Column Name</th>
              <th className="p-3 w-10 text-center"></th>
              <th className="p-3">Target CRM Field</th>
              <th className="p-3 w-28 text-right">Match Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 font-medium">
            {currentMapping.map((item) => (
              <tr key={item.fileColumn} className="hover:bg-muted/30">
                <td className="p-3 text-foreground font-semibold">
                  <span>{item.fileColumn}</span>
                </td>

                <td className="p-3 text-center text-muted-foreground">
                  <ArrowRight className="h-3.5 w-3.5 mx-auto" />
                </td>

                <td className="p-3">
                  <select
                    value={item.crmField}
                    onChange={(e) => handleFieldChange(item.fileColumn, e.target.value)}
                    className="w-full text-xs p-1.5 rounded-md border border-input bg-background text-foreground font-medium"
                  >
                    <option value="ignore">-- Skip / Ignore Column --</option>
                    {availableCrmFields.map((field) => (
                      <option key={field.key} value={field.key}>
                        {field.label} {field.required ? '*' : ''}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="p-3 text-right">
                  <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                    <Check className="h-3 w-3 mr-0.5" /> AI Mapped
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" size="sm" onClick={onBack} className="text-xs">
          Back to Upload
        </Button>
        <Button size="sm" onClick={() => onConfirmMapping(currentMapping)} className="gap-1.5 text-xs">
          <span>Continue to Import Preview</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
