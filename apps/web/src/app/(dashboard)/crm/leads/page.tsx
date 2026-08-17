'use client';

import * as React from 'react';
import { CRMLayout } from '@/features/crm/layouts/crm-layout';
import { StatsCard } from '@/features/crm/components/stats-card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Flame,
  CheckCircle2,
  TrendingUp,
  Download,
  Upload,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';
import {
  Lead,
  LeadFilters,
  LeadFormValues,
  LeadStats,
  LeadBulkActionType,
  LeadStatus,
  LeadPriority,
} from '@/features/crm/types/lead-types';
import {
  fetchLeads,
  createLead,
  updateLead,
  deleteLead,
  archiveLead,
  convertLeadToCustomer,
  executeLeadBulkAction,
  exportLeads,
} from '@/features/crm/services/lead-service';
import { LeadTable } from '@/features/crm/components/leads/lead-table';
import { LeadFiltersBar } from '@/features/crm/components/leads/lead-filters-bar';
import { LeadFormModal } from '@/features/crm/components/leads/lead-form-modal';
import { LeadConvertModal } from '@/features/crm/components/leads/lead-convert-modal';
import { LeadBulkActionsBar } from '@/features/crm/components/leads/lead-bulk-actions-bar';

export default function LeadsPage() {
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [stats, setStats] = React.useState<LeadStats>({
    totalLeads: 0,
    hotLeads: 0,
    qualifiedLeads: 0,
    convertedLeads: 0,
    conversionRate: 0,
    totalDealValue: 0,
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [total, setTotal] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(1);

  const [filters, setFilters] = React.useState<LeadFilters>({
    search: '',
    status: 'ALL',
    priority: 'ALL',
    source: 'ALL',
    scoreRange: 'ALL',
    isArchived: false,
    isDeleted: false,
    page: 1,
    pageSize: 10,
    sortField: 'createdAt',
    sortOrder: 'desc',
  });

  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [activeLeadForForm, setActiveLeadForForm] = React.useState<Lead | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [convertTargetLead, setConvertTargetLead] = React.useState<Lead | null>(null);
  const [isConvertModalOpen, setIsConvertModalOpen] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);

  const loadLeadsData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetchLeads(filters);
      setLeads(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
      if (res.stats) {
        setStats(res.stats);
      }
    } catch (err: any) {
      console.error('Failed to load leads:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    loadLeadsData();
  }, [loadLeadsData]);

  const handleFilterChange = (newFilters: Partial<LeadFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'ALL',
      priority: 'ALL',
      source: 'ALL',
      scoreRange: 'ALL',
      isArchived: false,
      isDeleted: false,
      page: 1,
      pageSize: 10,
      sortField: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const handleSelectToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllToggle = () => {
    if (selectedIds.length === leads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map((l) => l.id));
    }
  };

  const handleSortChange = (field: string) => {
    setFilters((prev) => ({
      ...prev,
      sortField: field,
      sortOrder: prev.sortField === field && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Lead Form Actions
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
    await loadLeadsData();
  };

  // Lead Conversion Actions
  const handleOpenConvertModal = (lead: Lead) => {
    setConvertTargetLead(lead);
    setIsConvertModalOpen(true);
  };

  const handleConvertSubmit = async (payload: { customerStatus?: string; notes?: string }) => {
    if (!convertTargetLead) return;
    await convertLeadToCustomer(convertTargetLead.id, payload);
    await loadLeadsData();
  };

  // Archive & Soft Delete Actions
  const handleArchiveToggle = async (lead: Lead) => {
    await archiveLead(lead.id, !lead.isArchived);
    await loadLeadsData();
  };

  const handleDeleteLead = async (lead: Lead) => {
    if (confirm(`Are you sure you want to soft delete lead ${lead.name}?`)) {
      await deleteLead(lead.id);
      await loadLeadsData();
    }
  };

  // Bulk Actions
  const handleExecuteBulkAction = async (
    action: LeadBulkActionType,
    payload?: {
      assignedEmployeeId?: string;
      status?: LeadStatus;
      priority?: LeadPriority;
      tags?: string[];
    }
  ) => {
    await executeLeadBulkAction({
      leadIds: selectedIds,
      action,
      ...payload,
    });
    setSelectedIds([]);
    await loadLeadsData();
  };

  // Export Action
  const handleExportLeads = async (format: 'csv' | 'excel') => {
    try {
      await exportLeads(filters, format);
    } catch {
      alert('Export failed.');
    }
  };

  return (
    <CRMLayout
      title="Lead Management"
      description="Capture, qualify, score, assign, and convert sales leads into customers."
      breadcrumbs={[{ label: 'Leads' }]}
      showToolbar={false}
    >
      <div className="space-y-6">
        {/* Top Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="w-full sm:w-80">
            <input
              type="text"
              placeholder="Search leads by name, company, email, phone..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange({ search: e.target.value, page: 1 })}
              className="w-full text-xs px-3 py-2 rounded-lg border border-input bg-background text-foreground"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 h-8"
              onClick={() => setIsImportModalOpen(true)}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Import Leads</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 h-8"
              onClick={() => handleExportLeads('csv')}
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
              <span>Add Lead</span>
            </Button>
          </div>
        </div>

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Leads"
            value={stats.totalLeads.toLocaleString()}
            change="Active pipeline"
            trend="up"
            icon={<Users className="h-5 w-5 text-blue-500" />}
          />
          <StatsCard
            title="Hot Leads (50+ Score)"
            value={stats.hotLeads.toLocaleString()}
            change="High conversion potential"
            trend="up"
            icon={<Flame className="h-5 w-5 text-orange-500" />}
          />
          <StatsCard
            title="Qualified Leads"
            value={stats.qualifiedLeads.toLocaleString()}
            change="Ready for proposal"
            trend="up"
            icon={<CheckCircle2 className="h-5 w-5 text-purple-500" />}
          />
          <StatsCard
            title="Conversion Rate"
            value={`${stats.conversionRate}%`}
            change={`${stats.convertedLeads} leads converted to customers`}
            trend="up"
            icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
          />
        </div>

        {/* Filters Bar */}
        <LeadFiltersBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />

        {/* Main Leads Table */}
        <LeadTable
          leads={leads}
          isLoading={isLoading}
          selectedIds={selectedIds}
          onSelectToggle={handleSelectToggle}
          onSelectAllToggle={handleSelectAllToggle}
          onSortChange={handleSortChange}
          sortField={filters.sortField}
          sortOrder={filters.sortOrder}
          onEditLead={handleOpenEditModal}
          onConvertLead={handleOpenConvertModal}
          onArchiveLead={handleArchiveToggle}
          onDeleteLead={handleDeleteLead}
        />

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground pt-2">
          <div>
            Showing <strong>{leads.length}</strong> of <strong>{total}</strong> leads
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1"
              disabled={filters.page === 1}
              onClick={() => handleFilterChange({ page: (filters.page || 1) - 1 })}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </Button>
            <span className="font-semibold text-foreground">
              Page {filters.page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1"
              disabled={filters.page === totalPages}
              onClick={() => handleFilterChange({ page: (filters.page || 1) + 1 })}
            >
              <span>Next</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Floating Bulk Actions Bar */}
      <LeadBulkActionsBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onExecuteAction={handleExecuteBulkAction}
      />

      {/* Lead Create / Edit Modal */}
      <LeadFormModal
        isOpen={isFormModalOpen}
        lead={activeLeadForForm}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* Lead Convert Modal */}
      <LeadConvertModal
        isOpen={isConvertModalOpen}
        lead={convertTargetLead}
        onClose={() => setIsConvertModalOpen(false)}
        onConfirm={handleConvertSubmit}
      />

      {/* Import Placeholder Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-xl p-6 space-y-4 text-card-foreground">
            <div className="flex items-center space-x-2">
              <FileSpreadsheet className="h-6 w-6 text-primary" />
              <h3 className="text-base font-bold">Import Leads</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The full AI-powered CSV/PDF Lead Import workflow will be implemented in <strong>Task 006 (AI Lead Import)</strong>.
            </p>
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setIsImportModalOpen(false)}>
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}
    </CRMLayout>
  );
}
