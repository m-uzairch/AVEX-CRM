'use client';

import * as React from 'react';
import { CRMNavigation } from '../components/crm-navigation';
import { CRMHeader, BreadcrumbItem } from '../components/crm-header';
import { ActionToolbar } from '../components/action-toolbar';
import { PageContainer } from '../components/page-container';
import { FilterOption } from '../components/filter-dropdown';

export interface CRMLayoutProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  headerActions?: React.ReactNode;
  showToolbar?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  filterOptions?: FilterOption[];
  selectedFilterId?: string;
  onFilterSelect?: (id: string) => void;
  onExport?: () => void;
  onAddNew?: () => void;
  addNewLabel?: string;
  children: React.ReactNode;
}

export function CRMLayout({
  title,
  description,
  breadcrumbs,
  headerActions,
  showToolbar = false,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  filterOptions,
  selectedFilterId,
  onFilterSelect,
  onExport,
  onAddNew,
  addNewLabel,
  children,
}: CRMLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* CRM Sub-Navigation */}
      <CRMNavigation />

      {/* Main CRM Content Area */}
      <PageContainer>
        {/* Page Header */}
        <CRMHeader
          title={title}
          description={description}
          breadcrumbs={breadcrumbs}
          actions={headerActions}
        />

        {/* Action Toolbar (Search, Filter, Export, Add New) */}
        {showToolbar && (
          <ActionToolbar
            searchPlaceholder={searchPlaceholder}
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            filterOptions={filterOptions}
            selectedFilterId={selectedFilterId}
            onFilterSelect={onFilterSelect}
            onExport={onExport}
            onAddNew={onAddNew}
            addNewLabel={addNewLabel}
          />
        )}

        {/* Page Body Content */}
        <div className="pt-2">{children}</div>
      </PageContainer>
    </div>
  );
}
