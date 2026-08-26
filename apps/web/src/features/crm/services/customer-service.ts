import {
  Customer,
  CustomerFormData,
  CustomerNote,
  CustomerActivity,
  CustomerFilterState,
  BulkActionPayload,
  AssignedEmployee,
  CustomerProjectItem,
  CustomerInvoiceItem,
  CustomerFileItem,
  CustomerMeetingItem,
  CustomerSummaryStats,
} from '../types/customer-types';

// Initial Customers Store
const initialMockCustomers: Customer[] = [];

let localCustomersStore: Customer[] = [...initialMockCustomers];

const initialNotesStore: Record<string, CustomerNote[]> = {
  cust_001: [
    {
      id: 'note_1',
      customerId: 'cust_001',
      companyId: 'comp_001',
      content: 'Initial discovery call completed. Client requested enterprise pricing quote with 50 user licenses.',
      createdById: 'user_owner',
      createdByName: 'Alex Carter',
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ],
};

const initialActivitiesStore: Record<string, CustomerActivity[]> = {
  cust_001: [
    {
      id: 'act_1',
      customerId: 'cust_001',
      action: 'CUSTOMER_CREATED',
      description: 'Customer record created by Alex Carter',
      performedBy: 'Alex Carter',
      timestamp: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 'act_2',
      customerId: 'cust_001',
      action: 'TAGS_UPDATED',
      description: 'Tags added: VIP, Enterprise, High Paying',
      performedBy: 'Alex Carter',
      timestamp: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
  ],
};

export class CustomerService {
  /**
   * List customers with search, filtering, pagination, and sorting
   */
  static async getCustomers(filters: Partial<CustomerFilterState>): Promise<{
    data: Customer[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    try {
      const query = new URLSearchParams();
      if (filters.search) query.set('search', filters.search);
      if (filters.status && filters.status !== 'ALL') query.set('status', filters.status);
      if (filters.industry && filters.industry !== 'ALL') query.set('industry', filters.industry);
      if (filters.isArchived) query.set('isArchived', 'true');
      if (filters.isDeleted) query.set('isDeleted', 'true');
      if (filters.sortField) query.set('sortField', filters.sortField);
      if (filters.sortOrder) query.set('sortOrder', filters.sortOrder);
      if (filters.page) query.set('page', String(filters.page));
      if (filters.pageSize) query.set('pageSize', String(filters.pageSize));

      const res = await fetch(`/api/crm/customers?${query.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback to local memory store
    }

    // Local Fallback Filter Logic
    const filtered = localCustomersStore.filter((cust) => {
      // Trash / Soft Deleted View
      if (filters.isDeleted) {
        return Boolean(cust.deletedAt);
      }
      if (cust.deletedAt) return false;

      // Archive View
      if (filters.isArchived) {
        return cust.isArchived === true;
      }
      if (cust.isArchived) return false;

      // Status Filter
      if (filters.status && filters.status !== 'ALL' && cust.status !== filters.status) {
        return false;
      }

      // Industry Filter
      if (filters.industry && filters.industry !== 'ALL' && cust.industry !== filters.industry) {
        return false;
      }

      // Tag Filter
      if (filters.tag && filters.tag !== 'ALL' && !cust.tags.includes(filters.tag)) {
        return false;
      }

      // Search Query Filter
      if (filters.search) {
        const s = filters.search.toLowerCase();
        const matchesName = cust.name.toLowerCase().includes(s);
        const matchesCompany = cust.companyName.toLowerCase().includes(s);
        const matchesEmail = cust.email.toLowerCase().includes(s);
        const matchesPhone = cust.phone.toLowerCase().includes(s);
        const matchesTags = cust.tags.some((t) => t.toLowerCase().includes(s));
        return matchesName || matchesCompany || matchesEmail || matchesPhone || matchesTags;
      }

      return true;
    });

    // Sorting
    const sortField = filters.sortField || 'createdAt';
    const sortOrder = filters.sortOrder || 'desc';

    filtered.sort((a, b) => {
      const valA = a[sortField as keyof Customer] || '';
      const valB = b[sortField as keyof Customer] || '';
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    return {
      data: paginated,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  /**
   * Get single customer by ID
   */
  static async getCustomerById(id: string): Promise<Customer> {
    try {
      const res = await fetch(`/api/crm/customers/${id}`);
      if (res.ok) {
        const data = await res.json();
        return data.customer;
      }
    } catch {
      // Fallback to local
    }

    const found = localCustomersStore.find((c) => c.id === id);
    if (!found) {
      throw new Error(`Customer with ID "${id}" was not found.`);
    }
    return found;
  }

  /**
   * Create new customer
   */
  static async createCustomer(formData: CustomerFormData): Promise<Customer> {
    try {
      const res = await fetch('/api/crm/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        return data.customer;
      }
    } catch {
      // Fallback
    }

    const newCustomer: Customer = {
      id: `cust_${Date.now()}`,
      companyId: 'comp_001',
      assignedEmployeeId: formData.assignedEmployeeId || null,
      name: formData.name,
      companyName: formData.companyName,
      email: formData.email,
      phone: formData.phone,
      alternatePhone: formData.alternatePhone || null,
      country: formData.country || null,
      state: formData.state || null,
      city: formData.city || null,
      address: formData.address || null,
      postalCode: formData.postalCode || null,
      industry: formData.industry || 'Technology',
      businessType: formData.businessType || 'DIGITAL',
      website: formData.website || null,
      companySize: formData.companySize || '10-50',
      status: formData.status || 'ACTIVE',
      source: formData.source || 'Direct',
      priority: formData.priority || 'MEDIUM',
      tags: formData.tags || [],
      isArchived: false,
      deletedAt: null,
      createdBy: 'Alex Carter',
      updatedBy: 'Alex Carter',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localCustomersStore.unshift(newCustomer);

    // Record Activity
    if (!initialActivitiesStore[newCustomer.id]) {
      initialActivitiesStore[newCustomer.id] = [];
    }
    initialActivitiesStore[newCustomer.id].unshift({
      id: `act_${Date.now()}`,
      customerId: newCustomer.id,
      action: 'CUSTOMER_CREATED',
      description: `Customer account created for ${newCustomer.name} (${newCustomer.companyName})`,
      performedBy: 'Alex Carter',
      timestamp: new Date().toISOString(),
    });

    return newCustomer;
  }

  /**
   * Update customer
   */
  static async updateCustomer(id: string, formData: Partial<CustomerFormData>): Promise<Customer> {
    try {
      const res = await fetch(`/api/crm/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        return data.customer;
      }
    } catch {
      // Fallback
    }

    const index = localCustomersStore.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Customer with ID "${id}" not found.`);
    }

    const updated: Customer = {
      ...localCustomersStore[index],
      ...formData,
      updatedBy: 'Alex Carter',
      updatedAt: new Date().toISOString(),
    };

    localCustomersStore[index] = updated;

    if (!initialActivitiesStore[id]) initialActivitiesStore[id] = [];
    initialActivitiesStore[id].unshift({
      id: `act_${Date.now()}`,
      customerId: id,
      action: 'CUSTOMER_UPDATED',
      description: `Updated customer information for ${updated.name}`,
      performedBy: 'Alex Carter',
      timestamp: new Date().toISOString(),
    });

    return updated;
  }

  /**
   * Soft delete customer
   */
  static async deleteCustomer(id: string): Promise<void> {
    try {
      await fetch(`/api/crm/customers/${id}`, { method: 'DELETE' });
    } catch {
      // Fallback
    }

    const index = localCustomersStore.findIndex((c) => c.id === id);
    if (index !== -1) {
      localCustomersStore[index].deletedAt = new Date().toISOString();
      if (!initialActivitiesStore[id]) initialActivitiesStore[id] = [];
      initialActivitiesStore[id].unshift({
        id: `act_${Date.now()}`,
        customerId: id,
        action: 'CUSTOMER_DELETED',
        description: 'Customer moved to trash (soft deleted)',
        performedBy: 'Alex Carter',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Restore soft deleted customer
   */
  static async restoreCustomer(id: string): Promise<void> {
    try {
      await fetch(`/api/crm/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESTORE' }),
      });
    } catch {
      // Fallback
    }

    const index = localCustomersStore.findIndex((c) => c.id === id);
    if (index !== -1) {
      localCustomersStore[index].deletedAt = null;
      if (!initialActivitiesStore[id]) initialActivitiesStore[id] = [];
      initialActivitiesStore[id].unshift({
        id: `act_${Date.now()}`,
        customerId: id,
        action: 'CUSTOMER_RESTORED',
        description: 'Customer restored from trash',
        performedBy: 'Alex Carter',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Archive customer
   */
  static async archiveCustomer(id: string): Promise<void> {
    try {
      await fetch(`/api/crm/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: true }),
      });
    } catch {
      // Fallback
    }

    const index = localCustomersStore.findIndex((c) => c.id === id);
    if (index !== -1) {
      localCustomersStore[index].isArchived = true;
      if (!initialActivitiesStore[id]) initialActivitiesStore[id] = [];
      initialActivitiesStore[id].unshift({
        id: `act_${Date.now()}`,
        customerId: id,
        action: 'CUSTOMER_ARCHIVED',
        description: 'Customer archived',
        performedBy: 'Alex Carter',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Unarchive customer
   */
  static async unarchiveCustomer(id: string): Promise<void> {
    try {
      await fetch(`/api/crm/customers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: false }),
      });
    } catch {
      // Fallback
    }

    const index = localCustomersStore.findIndex((c) => c.id === id);
    if (index !== -1) {
      localCustomersStore[index].isArchived = false;
      if (!initialActivitiesStore[id]) initialActivitiesStore[id] = [];
      initialActivitiesStore[id].unshift({
        id: `act_${Date.now()}`,
        customerId: id,
        action: 'CUSTOMER_UNARCHIVED',
        description: 'Customer restored from archive',
        performedBy: 'Alex Carter',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Execute bulk action
   */
  static async bulkActions(payload: BulkActionPayload): Promise<void> {
    try {
      await fetch('/api/crm/customers/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // Fallback
    }

    const { action, customerIds, targetStatus, tags } = payload;
    localCustomersStore = localCustomersStore.map((cust) => {
      if (!customerIds.includes(cust.id)) return cust;

      if (action === 'DELETE') {
        return { ...cust, deletedAt: new Date().toISOString() };
      }
      if (action === 'RESTORE') {
        return { ...cust, deletedAt: null };
      }
      if (action === 'ARCHIVE') {
        return { ...cust, isArchived: true };
      }
      if (action === 'UNARCHIVE') {
        return { ...cust, isArchived: false };
      }
      if (action === 'CHANGE_STATUS' && targetStatus) {
        return { ...cust, status: targetStatus };
      }
      if (action === 'ADD_TAGS' && tags) {
        const set = new Set([...cust.tags, ...tags]);
        return { ...cust, tags: Array.from(set) };
      }
      if (action === 'REMOVE_TAGS' && tags) {
        return { ...cust, tags: cust.tags.filter((t) => !tags.includes(t)) };
      }
      return cust;
    });
  }

  /**
   * Get notes for customer
   */
  static async getNotes(customerId: string): Promise<CustomerNote[]> {
    try {
      const res = await fetch(`/api/crm/customers/${customerId}/notes`);
      if (res.ok) {
        const data = await res.json();
        return data.notes;
      }
    } catch {
      // Fallback
    }
    return initialNotesStore[customerId] || [];
  }

  /**
   * Add internal note for customer
   */
  static async addNote(customerId: string, content: string): Promise<CustomerNote> {
    try {
      const res = await fetch(`/api/crm/customers/${customerId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.note;
      }
    } catch {
      // Fallback
    }

    const newNote: CustomerNote = {
      id: `note_${Date.now()}`,
      customerId,
      companyId: 'comp_001',
      content,
      createdById: 'user_owner',
      createdByName: 'Alex Carter',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!initialNotesStore[customerId]) initialNotesStore[customerId] = [];
    initialNotesStore[customerId].unshift(newNote);

    if (!initialActivitiesStore[customerId]) initialActivitiesStore[customerId] = [];
    initialActivitiesStore[customerId].unshift({
      id: `act_${Date.now()}`,
      customerId,
      action: 'NOTE_ADDED',
      description: `Internal note added by Alex Carter`,
      performedBy: 'Alex Carter',
      timestamp: new Date().toISOString(),
    });

    return newNote;
  }

  /**
   * Edit internal note
   */
  static async editNote(customerId: string, noteId: string, content: string): Promise<CustomerNote> {
    try {
      const res = await fetch(`/api/crm/customers/${customerId}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, content }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.note;
      }
    } catch {
      // Fallback
    }

    const list = initialNotesStore[customerId] || [];
    const idx = list.findIndex((n) => n.id === noteId);
    if (idx !== -1) {
      list[idx] = {
        ...list[idx],
        content,
        updatedAt: new Date().toISOString(),
      };
      return list[idx];
    }
    throw new Error('Note not found');
  }

  /**
   * Delete internal note
   */
  static async deleteNote(customerId: string, noteId: string): Promise<void> {
    try {
      await fetch(`/api/crm/customers/${customerId}/notes?noteId=${noteId}`, {
        method: 'DELETE',
      });
    } catch {
      // Fallback
    }

    if (initialNotesStore[customerId]) {
      initialNotesStore[customerId] = initialNotesStore[customerId].filter((n) => n.id !== noteId);
    }
  }

  /**
   * Add tag to customer
   */
  static async addTag(customerId: string, tag: string): Promise<Customer> {
    const cust = await this.getCustomerById(customerId);
    const updatedTags = Array.from(new Set([...(cust.tags || []), tag.trim()]));
    return this.updateCustomer(customerId, { tags: updatedTags });
  }

  /**
   * Remove tag from customer
   */
  static async removeTag(customerId: string, tag: string): Promise<Customer> {
    const cust = await this.getCustomerById(customerId);
    const updatedTags = (cust.tags || []).filter((t) => t !== tag);
    return this.updateCustomer(customerId, { tags: updatedTags });
  }

  /**
   * Assign or change assigned employee
   */
  static async assignEmployee(customerId: string, employeeId: string | null): Promise<Customer> {
    return this.updateCustomer(customerId, { assignedEmployeeId: employeeId || undefined });
  }

  /**
   * Get available employees list for assignment
   */
  static async getEmployees(): Promise<AssignedEmployee[]> {
    return [
      { id: 'emp_001', name: 'Alex Carter', email: 'alex.carter@avex.com', role: 'Account Executive' },
      { id: 'emp_002', name: 'Elena Rostova', email: 'elena.r@avex.com', role: 'Senior Customer Success Manager' },
      { id: 'emp_003', name: 'David Miller', email: 'david.m@avex.com', role: 'Solutions Architect' },
      { id: 'emp_004', name: 'Sophia Chen', email: 'sophia.c@avex.com', role: 'Support Lead' },
    ];
  }

  /**
   * Get activity timeline for customer
   */
  static async getActivities(customerId: string): Promise<CustomerActivity[]> {
    return initialActivitiesStore[customerId] || [];
  }

  /**
   * Get placeholder project records for Sprint 03 preview
   */
  static async getProjects(_customerId: string): Promise<CustomerProjectItem[]> {
    return [
      {
        id: 'proj_101',
        name: 'Enterprise Cloud Migration & Setup',
        status: 'IN_PROGRESS',
        assignedTeam: 'Cloud Infrastructure Team',
        startDate: '2026-06-15',
        dueDate: '2026-08-30',
        progressPercent: 65,
      },
      {
        id: 'proj_102',
        name: 'Custom API Gateway Integration',
        status: 'PLANNING',
        assignedTeam: 'Integration Specialists',
        startDate: '2026-09-01',
        dueDate: '2026-10-15',
        progressPercent: 15,
      },
    ];
  }

  /**
   * Get placeholder invoice records for Invoice module preview
   */
  static async getInvoices(_customerId: string): Promise<CustomerInvoiceItem[]> {
    return [
      {
        id: 'inv_9001',
        invoiceNumber: 'INV-2026-0042',
        amount: 14500,
        currency: 'USD',
        dueDate: '2026-08-15',
        status: 'PAID',
      },
      {
        id: 'inv_9002',
        invoiceNumber: 'INV-2026-0089',
        amount: 8200,
        currency: 'USD',
        dueDate: '2026-09-01',
        status: 'UNPAID',
      },
    ];
  }

  /**
   * Get placeholder document/files records
   */
  static async getFiles(_customerId: string): Promise<CustomerFileItem[]> {
    return [
      {
        id: 'file_01',
        name: 'Master_Services_Agreement_2026.pdf',
        category: 'Contract',
        fileSize: '2.4 MB',
        uploadedAt: '2026-07-10',
        uploadedBy: 'Alex Carter',
        fileType: 'PDF',
      },
      {
        id: 'file_02',
        name: 'Enterprise_Quote_Q3_Final.pdf',
        category: 'Quotation',
        fileSize: '1.1 MB',
        uploadedAt: '2026-07-18',
        uploadedBy: 'Alex Carter',
        fileType: 'PDF',
      },
      {
        id: 'file_03',
        name: 'Payment_Receipt_Deposit.pdf',
        category: 'Receipt',
        fileSize: '480 KB',
        uploadedAt: '2026-07-22',
        uploadedBy: 'Finance System',
        fileType: 'PDF',
      },
    ];
  }

  /**
   * Get placeholder meetings schedule
   */
  static async getMeetings(_customerId: string): Promise<CustomerMeetingItem[]> {
    return [
      {
        id: 'meet_01',
        title: 'Quarterly Executive Business Review',
        date: '2026-08-05',
        time: '14:00 - 15:00 UTC',
        type: 'REVIEW',
        status: 'SCHEDULED',
        attendeesCount: 4,
      },
      {
        id: 'meet_02',
        title: 'Technical Onboarding & Architecture Sync',
        date: '2026-07-20',
        time: '10:00 - 11:30 UTC',
        type: 'DISCOVERY',
        status: 'COMPLETED',
        attendeesCount: 6,
      },
    ];
  }

  /**
   * Get quick customer statistics summary
   */
  static async getSummaryStats(_customerId: string): Promise<CustomerSummaryStats> {
    return {
      totalProjects: 2,
      totalInvoices: 2,
      totalPaymentsAmount: 14500,
      openLeads: 1,
      lastContactDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    };
  }

  /**
   * Export customers list as CSV file download
   */
  static exportCustomers(customers: Customer[], format: 'csv' | 'excel' = 'csv') {
    const headers = [
      'Customer Name',
      'Company Name',
      'Email',
      'Phone',
      'Industry',
      'Status',
      'Priority',
      'Tags',
      'Created Date',
    ];

    const rows = customers.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.companyName.replace(/"/g, '""')}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      `"${c.industry || ''}"`,
      `"${c.status}"`,
      `"${c.priority}"`,
      `"${c.tags.join('; ')}"`,
      `"${new Date(c.createdAt).toLocaleDateString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AVEX_CRM_Customers_${Date.now()}.${format === 'csv' ? 'csv' : 'csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
