/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CRMLayout } from '@/features/crm/layouts/crm-layout';
import { useCustomerStore } from '@/features/crm/stores/customer-store';
import { CustomerTable } from '@/features/crm/components/customers/customer-table';
import { CustomerFiltersBar } from '@/features/crm/components/customers/customer-filters-bar';
import { BulkActionsBar } from '@/features/crm/components/customers/bulk-actions-bar';
import { CustomerFormModal } from '@/features/crm/components/customers/customer-form-modal';
import { ImportCustomersModal } from '@/features/crm/components/customers/import-customers-modal';
import { CustomerStatus } from '@/features/crm/types/customer-types';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, Trash2, Archive, Users, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CustomersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<'all' | 'active' | 'prospect' | 'inactive' | 'archived' | 'trash'>('all');

  const {
    customers,
    total,
    page,
    pageSize,
    totalPages,
    filters,
    selectedIds,
    selectedCustomer,
    isFormOpen,
    formMode,
    isImportOpen,
    isLoading,
    fetchCustomers,
    setFilter,
    resetFilters,
    toggleSelectId,
    selectAllIds,
    clearSelection,
    openCreateForm,
    openEditForm,
    closeForm,
    openImportModal,
    closeImportModal,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    restoreCustomer,
    archiveCustomer,
    unarchiveCustomer,
    executeBulkAction,
    exportSelected,
  } = useCustomerStore();

  React.useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleTabChange = (tab: 'all' | 'active' | 'prospect' | 'inactive' | 'archived' | 'trash') => {
    setActiveTab(tab);
    clearSelection();

    if (tab === 'all') {
      setFilter({ status: 'ALL', isArchived: false, isDeleted: false });
    } else if (tab === 'archived') {
      setFilter({ status: 'ALL', isArchived: true, isDeleted: false });
    } else if (tab === 'trash') {
      setFilter({ status: 'ALL', isArchived: false, isDeleted: true });
    } else {
      const statusMap: Record<string, CustomerStatus> = {
        active: 'ACTIVE',
        prospect: 'PROSPECT',
        inactive: 'INACTIVE',
      };
      setFilter({ status: statusMap[tab], isArchived: false, isDeleted: false });
    }
  };

  const isTrashView = activeTab === 'trash';
  const isArchiveView = activeTab === 'archived';

  return (
    <CRMLayout
      title="Customer Management"
      description="Centralized directory to create, edit, track, archive, and manage your company client accounts."
      breadcrumbs={[{ label: 'Customers' }]}
      headerActions={
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openImportModal}
            className="h-9 px-3 text-xs flex items-center space-x-1.5 border-border"
          >
            <Upload className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">Import</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportSelected}
            className="h-9 px-3 text-xs flex items-center space-x-1.5 border-border"
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden sm:inline">
              Export {selectedIds.length > 0 ? `(${selectedIds.length})` : 'All'}
            </span>
          </Button>

          <Button
            size="sm"
            onClick={openCreateForm}
            className="h-9 px-3.5 text-xs flex items-center space-x-1.5 shadow-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Customer</span>
          </Button>
        </div>
      }
    >
      {/* Top Status Tabs */}
      <div className="flex border-b border-border bg-card/40 rounded-t-lg px-2 space-x-1 overflow-x-auto text-xs mb-4">
        {[
          { id: 'all', label: 'All Customers', icon: <Users className="h-3.5 w-3.5" /> },
          { id: 'active', label: 'Active', icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> },
          { id: 'prospect', label: 'Prospects', icon: <Users className="h-3.5 w-3.5 text-amber-500" /> },
          { id: 'inactive', label: 'Inactive', icon: <Users className="h-3.5 w-3.5 text-muted-foreground" /> },
          { id: 'archived', label: 'Archived', icon: <Archive className="h-3.5 w-3.5 text-purple-500" /> },
          { id: 'trash', label: 'Trash', icon: <Trash2 className="h-3.5 w-3.5 text-rose-500" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as any)}
            className={cn(
              'flex items-center space-x-1.5 py-2.5 px-3 border-b-2 font-medium transition-colors shrink-0',
              activeTab === tab.id
                ? 'border-primary text-primary font-bold bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="space-y-4 mb-4">
        <CustomerFiltersBar
          filters={filters}
          onFilterChange={(f) => setFilter(f)}
          onResetFilters={resetFilters}
        />
      </div>

      {/* Main Table Data Grid */}
      <CustomerTable
        customers={customers}
        total={total}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        selectedIds={selectedIds}
        isLoading={isLoading}
        isTrashView={isTrashView}
        isArchiveView={isArchiveView}
        sortField={filters.sortField}
        sortOrder={filters.sortOrder}
        onSort={(field) =>
          setFilter({
            sortField: field,
            sortOrder: filters.sortField === field && filters.sortOrder === 'asc' ? 'desc' : 'asc',
          })
        }
        onPageChange={(p) => setFilter({ page: p })}
        onSelectId={toggleSelectId}
        onSelectAll={selectAllIds}
        onView={(cust) => router.push(`/crm/customers/${cust.id}`)}
        onEdit={(cust) => openEditForm(cust)}
        onDelete={(cust) => deleteCustomer(cust.id)}
        onArchive={(cust) => (cust.isArchived ? unarchiveCustomer(cust.id) : archiveCustomer(cust.id))}
        onRestore={(cust) => restoreCustomer(cust.id)}
        onAddNew={openCreateForm}
      />

      {/* Floating Bulk Action Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.length}
        isTrashView={isTrashView}
        isArchiveView={isArchiveView}
        onClearSelection={clearSelection}
        onExecuteAction={(action, extra) => executeBulkAction({ action, ...extra })}
      />

      {/* Add / Edit Customer Form Modal */}
      <CustomerFormModal
        isOpen={isFormOpen}
        mode={formMode}
        initialData={selectedCustomer}
        onClose={closeForm}
        onSubmit={async (values) => {
          if (formMode === 'create') {
            await createCustomer(values);
          } else if (selectedCustomer) {
            await updateCustomer(selectedCustomer.id, values);
          }
        }}
        isLoading={isLoading}
      />

      {/* Import Modal */}
      <ImportCustomersModal isOpen={isImportOpen} onClose={closeImportModal} />
    </CRMLayout>
  );
}
