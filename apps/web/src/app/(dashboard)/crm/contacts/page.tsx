'use client';

import * as React from 'react';
import { CRMLayout } from '@/features/crm/layouts/crm-layout';
import { DataTablePlaceholder, ColumnDefinition } from '@/features/crm/components/data-table-placeholder';
import { Contact, Mail, Phone, Building2, Briefcase } from 'lucide-react';

interface ContactRecord {
  id: string;
  name: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
}

const mockContacts: ContactRecord[] = [];

export default function ContactsPage() {
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState('all');

  const columns: ColumnDefinition<ContactRecord>[] = [
    {
      header: 'Full Name',
      accessorKey: 'name',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <div className="h-7 w-7 rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-xs flex items-center justify-center shrink-0">
            {row.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="font-semibold text-foreground block">{row.name}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Job Title',
      accessorKey: 'jobTitle',
      cell: (row) => (
        <div className="flex items-center space-x-1.5 text-muted-foreground">
          <Briefcase className="h-3.5 w-3.5" />
          <span>{row.jobTitle}</span>
        </div>
      ),
    },
    {
      header: 'Company',
      accessorKey: 'company',
      cell: (row) => (
        <div className="flex items-center space-x-1.5 text-muted-foreground">
          <Building2 className="h-3.5 w-3.5" />
          <span>{row.company}</span>
        </div>
      ),
    },
    {
      header: 'Email',
      accessorKey: 'email',
      cell: (row) => (
        <div className="flex items-center space-x-1.5 text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          <span>{row.email}</span>
        </div>
      ),
    },
    {
      header: 'Phone',
      accessorKey: 'phone',
      cell: (row) => (
        <div className="flex items-center space-x-1.5 text-muted-foreground">
          <Phone className="h-3.5 w-3.5" />
          <span>{row.phone}</span>
        </div>
      ),
    },
  ];

  return (
    <CRMLayout
      title="Contact Directory"
      description="Manage individual contact persons, roles, email addresses, and phone numbers."
      breadcrumbs={[{ label: 'Contacts' }]}
      showToolbar
      searchPlaceholder="Search contacts by name, title, or company..."
      searchValue={search}
      onSearchChange={setSearch}
      selectedFilterId={filter}
      onFilterSelect={setFilter}
      onExport={() => alert('Exporting contacts data...')}
      onAddNew={() => alert('Add Contact modal will be implemented in subsequent CRUD tasks.')}
      addNewLabel="Add Contact"
    >
      <DataTablePlaceholder
        columns={columns}
        data={mockContacts}
        emptyTitle="No contacts added"
        emptyDescription="Keep track of key decision makers, stakeholders, and account representatives."
        emptyIcon={<Contact className="h-6 w-6" />}
        onAddNew={() => alert('Add Contact modal will be implemented in subsequent CRUD tasks.')}
        addNewLabel="Add First Contact"
      />
    </CRMLayout>
  );
}
