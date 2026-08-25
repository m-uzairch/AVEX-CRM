'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SettingsService } from '../services/settings-service';
import { Layers, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

export function CRMPreferencesForm() {
  const { success, error: toastError } = useToast();

  const [defaultCustomerView, setDefaultCustomerView] = React.useState<'TABLE' | 'CARDS'>('TABLE');
  const [defaultLeadView, setDefaultLeadView] = React.useState<'KANBAN' | 'LIST'>('KANBAN');
  const [defaultPipelineView, setDefaultPipelineView] = React.useState<'STAGE_COLUMNS' | 'METRICS_TABLE'>('STAGE_COLUMNS');
  const [defaultInvoiceCurrency, setDefaultInvoiceCurrency] = React.useState('USD');
  const [defaultQuotationCurrency, setDefaultQuotationCurrency] = React.useState('USD');
  const [defaultPageSize, setDefaultPageSize] = React.useState(25);
  const [numberFormat, setNumberFormat] = React.useState<'STANDARD' | 'COMPACT'>('STANDARD');
  const [dateFormat, setDateFormat] = React.useState<'YYYY-MM-DD' | 'MM/DD/YYYY' | 'DD/MM/YYYY'>('YYYY-MM-DD');

  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [statusMsg, setStatusMsg] = React.useState<string | null>(null);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const data = await SettingsService.getCRMPreferences();
        setDefaultCustomerView(data.defaultCustomerView);
        setDefaultLeadView(data.defaultLeadView);
        setDefaultPipelineView(data.defaultPipelineView);
        setDefaultInvoiceCurrency(data.defaultInvoiceCurrency);
        setDefaultQuotationCurrency(data.defaultQuotationCurrency);
        setDefaultPageSize(data.defaultPageSize);
        setNumberFormat(data.numberFormat);
        setDateFormat(data.dateFormat);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to load CRM preferences');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);
    setErrorMsg(null);

    try {
      await SettingsService.updateCRMPreferences({
        defaultCustomerView,
        defaultLeadView,
        defaultPipelineView,
        defaultInvoiceCurrency,
        defaultQuotationCurrency,
        defaultPageSize: Number(defaultPageSize),
        numberFormat,
        dateFormat,
      });
      success('CRM Preferences saved', 'Your CRM layouts, default views, and page sizes have been updated.');
      setStatusMsg('CRM preferences saved successfully.');
    } catch (err: any) {
      const msg = err.message || 'Failed to save CRM preferences.';
      setErrorMsg(msg);
      toastError('Save failed', msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 flex justify-center items-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Layers className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base font-semibold">CRM Workspace Preferences</CardTitle>
            <CardDescription className="text-xs">
              Configure default display layouts, page pagination sizes, and financial currencies across modules.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSave}>
        <CardContent className="space-y-4">
          {statusMsg && (
            <div className="flex items-center space-x-2 rounded-lg bg-emerald-500/15 p-3 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center space-x-2 rounded-lg bg-destructive/15 p-3 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Default Customer View</label>
              <select
                value={defaultCustomerView}
                onChange={(e) => setDefaultCustomerView(e.target.value as any)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden"
              >
                <option value="TABLE">Data Table View (Compact)</option>
                <option value="CARDS">Card Grid View (Visual)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Default Lead View</label>
              <select
                value={defaultLeadView}
                onChange={(e) => setDefaultLeadView(e.target.value as any)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden"
              >
                <option value="KANBAN">Kanban Pipeline Board</option>
                <option value="LIST">Sorted Data List</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Default Pipeline Layout</label>
              <select
                value={defaultPipelineView}
                onChange={(e) => setDefaultPipelineView(e.target.value as any)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden"
              >
                <option value="STAGE_COLUMNS">Stage Column Flow</option>
                <option value="METRICS_TABLE">Metrics & Funnel Table</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Default Page Size</label>
              <select
                value={defaultPageSize}
                onChange={(e) => setDefaultPageSize(Number(e.target.value))}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden"
              >
                <option value="10">10 items per page</option>
                <option value="25">25 items per page (Recommended)</option>
                <option value="50">50 items per page</option>
                <option value="100">100 items per page</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Default Invoice Currency</label>
              <select
                value={defaultInvoiceCurrency}
                onChange={(e) => setDefaultInvoiceCurrency(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden font-mono"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AED">AED (د.إ)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Default Quotation Currency</label>
              <select
                value={defaultQuotationCurrency}
                onChange={(e) => setDefaultQuotationCurrency(e.target.value)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden font-mono"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AED">AED (د.إ)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Financial Numbers Format</label>
              <select
                value={numberFormat}
                onChange={(e) => setNumberFormat(e.target.value as any)}
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-xs font-medium focus:outline-hidden"
              >
                <option value="STANDARD">Standard ($124,500.00)</option>
                <option value="COMPACT">Compact ($124.5k)</option>
              </select>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end border-t border-border pt-4">
          <Button type="submit" size="sm" disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />}
            Save CRM Preferences
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
