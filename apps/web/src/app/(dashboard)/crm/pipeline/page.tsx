'use client';

import * as React from 'react';
import { CRMLayout } from '@/features/crm/layouts/crm-layout';
import { Button } from '@/components/ui/button';
import { Plus, Download, RefreshCw } from 'lucide-react';
import {
  KanbanColumn as KanbanColumnType,
  PipelineMetrics as PipelineMetricsType,
  PipelineFilterOptions,
} from '@/features/crm/types/pipeline-types';
import { Lead, LeadFormValues, LeadStatus } from '@/features/crm/types/lead-types';
import {
  fetchPipelineData,
  updateLeadStage,
} from '@/features/crm/services/pipeline-service';
import {
  createLead,
  updateLead,
  deleteLead,
  archiveLead,
  convertLeadToCustomer,
  exportLeads,
} from '@/features/crm/services/lead-service';

import { KanbanBoard } from '@/features/crm/components/pipeline/kanban-board';
import { PipelineMetrics } from '@/features/crm/components/pipeline/pipeline-metrics';
import { PipelineFilterBar } from '@/features/crm/components/pipeline/pipeline-filter-bar';
import { LeadDetailsDrawer } from '@/features/crm/components/pipeline/lead-details-drawer';
import { LeadFormModal } from '@/features/crm/components/leads/lead-form-modal';
import { LeadConvertModal } from '@/features/crm/components/leads/lead-convert-modal';

export default function PipelinePage() {
  const [columns, setColumns] = React.useState<KanbanColumnType[]>([]);
  const [metrics, setMetrics] = React.useState<PipelineMetricsType>({
    totalLeads: 0,
    totalPipelineValue: 0,
    wonDealsCount: 0,
    lostDealsCount: 0,
    averageDealSize: 0,
    conversionRate: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);

  const [filters, setFilters] = React.useState<PipelineFilterOptions>({
    search: '',
    assignedEmployeeId: 'ALL',
    priority: 'ALL',
    source: 'ALL',
    scoreRange: 'ALL',
    sortField: 'createdAt',
    sortOrder: 'desc',
  });

  const [drawerLead, setDrawerLead] = React.useState<Lead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  const [activeLeadForForm, setActiveLeadForForm] = React.useState<Lead | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);

  const [convertTargetLead, setConvertTargetLead] = React.useState<Lead | null>(null);
  const [isConvertModalOpen, setIsConvertModalOpen] = React.useState(false);

  const loadPipeline = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetchPipelineData(filters);
      setColumns(res.columns || []);
      if (res.metrics) setMetrics(res.metrics);
    } catch (err: any) {
      console.error('Failed to load pipeline data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    loadPipeline();
  }, [loadPipeline]);

  const handleFilterChange = (newFilters: Partial<PipelineFilterOptions>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      assignedEmployeeId: 'ALL',
      priority: 'ALL',
      source: 'ALL',
      scoreRange: 'ALL',
      sortField: 'createdAt',
      sortOrder: 'desc',
    });
  };

  // Drag-and-drop handler with optimistic UI update
  const handleDropLead = async (leadId: string, toStage: LeadStatus) => {
    // Optimistically move card in local columns state
    setColumns((prevColumns) => {
      let targetLead: Lead | null = null;
      const updated = prevColumns.map((col) => {
        const found = col.leads.find((l) => l.id === leadId);
        if (found) {
          targetLead = { ...found, status: toStage };
          return {
            ...col,
            leads: col.leads.filter((l) => l.id !== leadId),
            leadCount: Math.max(0, col.leadCount - 1),
            totalValue: Math.max(0, col.totalValue - (found.expectedDealValue || 0)),
          };
        }
        return col;
      });

      if (targetLead) {
        return updated.map((col) => {
          if (col.id === toStage) {
            return {
              ...col,
              leads: [targetLead!, ...col.leads],
              leadCount: col.leadCount + 1,
              totalValue: col.totalValue + ((targetLead as Lead).expectedDealValue || 0),
            };
          }
          return col;
        });
      }

      return prevColumns;
    });

    try {
      await updateLeadStage(leadId, toStage);
      await loadPipeline();
    } catch (err: any) {
      alert(err?.message || 'Failed to move lead stage');
      await loadPipeline();
    }
  };

  // Card click handler
  const handleCardClick = (lead: Lead) => {
    setDrawerLead(lead);
    setIsDrawerOpen(true);
  };

  // Form Modal Handlers
  const handleOpenCreateModal = () => {
    setActiveLeadForForm(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (lead: Lead) => {
    setActiveLeadForForm(lead);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (values: LeadFormValues) => {
    if (activeLeadForForm) {
      await updateLead(activeLeadForForm.id, values);
    } else {
      await createLead(values);
    }
    await loadPipeline();
  };

  // Convert Modal Handlers
  const handleOpenConvertModal = (lead: Lead) => {
    setConvertTargetLead(lead);
    setIsConvertModalOpen(true);
  };

  const handleConvertSubmit = async (payload: { customerStatus?: string; notes?: string }) => {
    if (!convertTargetLead) return;
    await convertLeadToCustomer(convertTargetLead.id, payload);
    await loadPipeline();
  };

  // Archive & Delete Handlers
  const handleArchiveToggle = async (lead: Lead) => {
    await archiveLead(lead.id, !lead.isArchived);
    await loadPipeline();
  };

  const handleDeleteLead = async (lead: Lead) => {
    if (confirm(`Are you sure you want to soft delete lead ${lead.name}?`)) {
      await deleteLead(lead.id);
      await loadPipeline();
    }
  };

  return (
    <CRMLayout
      title="Lead Sales Pipeline"
      description="Visual Kanban Board for tracking deal progression across sales lifecycle stages."
      breadcrumbs={[{ label: 'Pipeline' }]}
      showToolbar={false}
    >
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="w-full sm:w-80">
            <input
              type="text"
              placeholder="Search cards by name, company, email..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded-lg border border-input bg-background text-foreground"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 h-8"
              onClick={() => loadPipeline()}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh Board</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 h-8"
              onClick={() => exportLeads({}, 'csv')}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </Button>

            <Button
              size="sm"
              className="text-xs gap-1.5 h-8"
              onClick={handleOpenCreateModal}
            >
              <Plus className="h-4 w-4" />
              <span>New Opportunity</span>
            </Button>
          </div>
        </div>

        {/* Metrics Strip */}
        <PipelineMetrics metrics={metrics} />

        {/* Filter Bar */}
        <PipelineFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />

        {/* Main Kanban Board */}
        {isLoading && columns.length === 0 ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            Loading Kanban board...
          </div>
        ) : (
          <KanbanBoard
            columns={columns}
            onDropLead={handleDropLead}
            onCardClick={handleCardClick}
            onEditLead={handleOpenEditModal}
            onConvertLead={handleOpenConvertModal}
            onArchiveLead={handleArchiveToggle}
            onDeleteLead={handleDeleteLead}
          />
        )}
      </div>

      {/* Slide-over Details Drawer */}
      <LeadDetailsDrawer
        lead={drawerLead}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onLeadUpdated={loadPipeline}
        onEditLead={handleOpenEditModal}
        onConvertLead={handleOpenConvertModal}
        onArchiveLead={handleArchiveToggle}
        onDeleteLead={handleDeleteLead}
      />

      {/* Create / Edit Form Modal */}
      <LeadFormModal
        isOpen={isFormModalOpen}
        lead={activeLeadForForm}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Convert to Customer Modal */}
      <LeadConvertModal
        isOpen={isConvertModalOpen}
        lead={convertTargetLead}
        onClose={() => setIsConvertModalOpen(false)}
        onConfirm={handleConvertSubmit}
      />
    </CRMLayout>
  );
}
