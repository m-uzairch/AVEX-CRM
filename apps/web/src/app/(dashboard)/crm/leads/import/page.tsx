'use client';

import * as React from 'react';
import Link from 'next/link';
import { CRMLayout } from '@/features/crm/layouts/crm-layout';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Sparkles, History } from 'lucide-react';
import {
  ImportJob,
  FieldMappingItem,
  ParsedLeadRow,
  DuplicateStrategy,
} from '@/features/crm/types/import-types';
import {
  uploadImportFile,
  fetchImportJobs,
  executeImportJob,
} from '@/features/crm/services/import-service';

import { ImportUploadStep } from '@/features/crm/components/import/import-upload-step';
import { ImportMappingStep } from '@/features/crm/components/import/import-mapping-step';
import { ImportPreviewStep } from '@/features/crm/components/import/import-preview-step';
import { ImportResultsStep } from '@/features/crm/components/import/import-results-step';
import { ImportHistoryTable } from '@/features/crm/components/import/import-history-table';

export default function LeadImportPage() {
  const [activeTab, setActiveTab] = React.useState<'wizard' | 'history'>('wizard');
  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3 | 4>(1);

  const [activeJob, setActiveJob] = React.useState<ImportJob | null>(null);
  const [mapping, setMapping] = React.useState<FieldMappingItem[]>([]);
  const [previewRows, setPreviewRows] = React.useState<ParsedLeadRow[]>([]);

  const [isUploading, setIsUploading] = React.useState(false);
  const [isExecuting, setIsExecuting] = React.useState(false);

  const [historyJobs, setHistoryJobs] = React.useState<ImportJob[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = React.useState(false);

  const loadHistory = React.useCallback(async () => {
    try {
      setIsHistoryLoading(true);
      const jobs = await fetchImportJobs();
      setHistoryJobs(jobs);
    } catch (err: any) {
      console.error('Failed to load import history:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (activeTab === 'history') {
      loadHistory();
    }
  }, [activeTab, loadHistory]);

  // Step 1: Upload File
  const handleUploadFile = async (file: File) => {
    try {
      setIsUploading(true);
      const job = await uploadImportFile(file);
      setActiveJob(job);
      setMapping(job.fieldMapping || []);
      setPreviewRows(job.extractedData || []);
      setCurrentStep(2);
    } finally {
      setIsUploading(false);
    }
  };

  // Step 2: Confirm Mapping
  const handleConfirmMapping = (updatedMapping: FieldMappingItem[]) => {
    setMapping(updatedMapping);
    setCurrentStep(3);
  };

  // Step 3: Execute Batch Import
  const handleExecuteImport = async (
    rows: ParsedLeadRow[],
    duplicateStrategy: DuplicateStrategy
  ) => {
    if (!activeJob) return;
    try {
      setIsExecuting(true);
      const completedJob = await executeImportJob({
        jobId: activeJob.id,
        rows,
        duplicateStrategy,
      });
      setActiveJob(completedJob);
      setCurrentStep(4);
    } catch (err: any) {
      alert(err?.message || 'Failed to execute import batch');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleResetWizard = () => {
    setActiveJob(null);
    setMapping([]);
    setPreviewRows([]);
    setCurrentStep(1);
  };

  return (
    <CRMLayout
      title="AI Lead Import System"
      description="Import leads from CSV, Excel, PDF documents, and business cards via Gemini AI & OCR."
      breadcrumbs={[
        { label: 'Leads', href: '/crm/leads' },
        { label: 'AI Import' },
      ]}
      showToolbar={false}
    >
      <div className="space-y-6 text-xs">
        {/* Top bar with back button & tab selector */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-4 rounded-xl">
          <Link href="/crm/leads">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Leads</span>
            </Button>
          </Link>

          <div className="flex items-center space-x-2">
            <Button
              variant={activeTab === 'wizard' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('wizard')}
              className="gap-1.5 text-xs h-8"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Import Wizard</span>
            </Button>

            <Button
              variant={activeTab === 'history' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('history')}
              className="gap-1.5 text-xs h-8"
            >
              <History className="h-3.5 w-3.5" />
              <span>Import History</span>
            </Button>
          </div>
        </div>

        {/* Tab 1: Wizard Content */}
        {activeTab === 'wizard' && (
          <div className="space-y-6">
            {/* Step Indicator Bar */}
            <div className="grid grid-cols-4 gap-2 bg-card border border-border p-3 rounded-xl text-center">
              <div
                className={`py-2 px-1 rounded-lg border font-bold text-[11px] flex items-center justify-center space-x-1.5 ${
                  currentStep === 1
                    ? 'border-primary bg-primary/10 text-primary'
                    : currentStep > 1
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600'
                    : 'border-border text-muted-foreground'
                }`}
              >
                <span>1. Upload File</span>
              </div>

              <div
                className={`py-2 px-1 rounded-lg border font-bold text-[11px] flex items-center justify-center space-x-1.5 ${
                  currentStep === 2
                    ? 'border-primary bg-primary/10 text-primary'
                    : currentStep > 2
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600'
                    : 'border-border text-muted-foreground'
                }`}
              >
                <span>2. Field Mapping</span>
              </div>

              <div
                className={`py-2 px-1 rounded-lg border font-bold text-[11px] flex items-center justify-center space-x-1.5 ${
                  currentStep === 3
                    ? 'border-primary bg-primary/10 text-primary'
                    : currentStep > 3
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600'
                    : 'border-border text-muted-foreground'
                }`}
              >
                <span>3. Preview & Edit</span>
              </div>

              <div
                className={`py-2 px-1 rounded-lg border font-bold text-[11px] flex items-center justify-center space-x-1.5 ${
                  currentStep === 4
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-border text-muted-foreground'
                }`}
              >
                <span>4. Results</span>
              </div>
            </div>

            {/* Step Components */}
            {currentStep === 1 && (
              <ImportUploadStep
                onFileSelected={handleUploadFile}
                isUploading={isUploading}
              />
            )}

            {currentStep === 2 && (
              <ImportMappingStep
                mapping={mapping}
                onConfirmMapping={handleConfirmMapping}
                onBack={() => setCurrentStep(1)}
              />
            )}

            {currentStep === 3 && (
              <ImportPreviewStep
                rows={previewRows}
                onExecuteImport={handleExecuteImport}
                onBack={() => setCurrentStep(2)}
                isExecuting={isExecuting}
              />
            )}

            {currentStep === 4 && activeJob && (
              <ImportResultsStep job={activeJob} onReset={handleResetWizard} />
            )}
          </div>
        )}

        {/* Tab 2: History Content */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-foreground">Workspace Import Batch History</h3>
            <ImportHistoryTable jobs={historyJobs} isLoading={isHistoryLoading} />
          </div>
        )}
      </div>
    </CRMLayout>
  );
}
