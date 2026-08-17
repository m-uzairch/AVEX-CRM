import { create } from 'zustand';
import {
  Customer,
  CustomerFormData,
  CustomerFilterState,
  BulkActionPayload,
} from '../types/customer-types';
import { CustomerService } from '../services/customer-service';

export interface CustomerStoreState {
  customers: Customer[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters: CustomerFilterState;
  selectedIds: string[];
  selectedCustomer: Customer | null;
  isFormOpen: boolean;
  formMode: 'create' | 'edit';
  isImportOpen: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCustomers: () => Promise<void>;
  setFilter: (newFilters: Partial<CustomerFilterState>) => void;
  resetFilters: () => void;
  toggleSelectId: (id: string) => void;
  selectAllIds: (ids: string[]) => void;
  clearSelection: () => void;
  openCreateForm: () => void;
  openEditForm: (customer: Customer) => void;
  closeForm: () => void;
  openImportModal: () => void;
  closeImportModal: () => void;

  createCustomer: (data: CustomerFormData) => Promise<Customer>;
  updateCustomer: (id: string, data: Partial<CustomerFormData>) => Promise<Customer>;
  deleteCustomer: (id: string) => Promise<void>;
  restoreCustomer: (id: string) => Promise<void>;
  archiveCustomer: (id: string) => Promise<void>;
  unarchiveCustomer: (id: string) => Promise<void>;
  executeBulkAction: (payload: Omit<BulkActionPayload, 'customerIds'>) => Promise<void>;
  exportSelected: () => void;
}

const initialFilters: CustomerFilterState = {
  search: '',
  status: 'ALL',
  industry: 'ALL',
  assignedEmployeeId: 'ALL',
  source: 'ALL',
  tag: 'ALL',
  isArchived: false,
  isDeleted: false,
  sortField: 'createdAt',
  sortOrder: 'desc',
  page: 1,
  pageSize: 10,
};

export const useCustomerStore = create<CustomerStoreState>((set, get) => ({
  customers: [],
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 1,
  filters: initialFilters,
  selectedIds: [],
  selectedCustomer: null,
  isFormOpen: false,
  formMode: 'create',
  isImportOpen: false,
  isLoading: false,
  error: null,

  fetchCustomers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await CustomerService.getCustomers(get().filters);
      set({
        customers: res.data,
        total: res.total,
        page: res.page,
        pageSize: res.pageSize,
        totalPages: res.totalPages,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Failed to fetch customers.',
        isLoading: false,
      });
    }
  },

  setFilter: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters, page: newFilters.page ?? 1 },
    }));
    get().fetchCustomers();
  },

  resetFilters: () => {
    set({ filters: initialFilters });
    get().fetchCustomers();
  },

  toggleSelectId: (id) => {
    set((state) => {
      const exists = state.selectedIds.includes(id);
      return {
        selectedIds: exists
          ? state.selectedIds.filter((item) => item !== id)
          : [...state.selectedIds, id],
      };
    });
  },

  selectAllIds: (ids) => {
    set({ selectedIds: ids });
  },

  clearSelection: () => {
    set({ selectedIds: [] });
  },

  openCreateForm: () => {
    set({ isFormOpen: true, formMode: 'create', selectedCustomer: null });
  },

  openEditForm: (customer) => {
    set({ isFormOpen: true, formMode: 'edit', selectedCustomer: customer });
  },

  closeForm: () => {
    set({ isFormOpen: false, selectedCustomer: null });
  },

  openImportModal: () => {
    set({ isImportOpen: true });
  },

  closeImportModal: () => {
    set({ isImportOpen: false });
  },

  createCustomer: async (data) => {
    set({ isLoading: true });
    try {
      const created = await CustomerService.createCustomer(data);
      get().fetchCustomers();
      get().closeForm();
      return created;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  updateCustomer: async (id, data) => {
    set({ isLoading: true });
    try {
      const updated = await CustomerService.updateCustomer(id, data);
      get().fetchCustomers();
      get().closeForm();
      return updated;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  deleteCustomer: async (id) => {
    set({ isLoading: true });
    try {
      await CustomerService.deleteCustomer(id);
      get().fetchCustomers();
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  restoreCustomer: async (id) => {
    set({ isLoading: true });
    try {
      await CustomerService.restoreCustomer(id);
      get().fetchCustomers();
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  archiveCustomer: async (id) => {
    set({ isLoading: true });
    try {
      await CustomerService.archiveCustomer(id);
      get().fetchCustomers();
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  unarchiveCustomer: async (id) => {
    set({ isLoading: true });
    try {
      await CustomerService.unarchiveCustomer(id);
      get().fetchCustomers();
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  executeBulkAction: async (payloadWithoutIds) => {
    const selectedIds = get().selectedIds;
    if (selectedIds.length === 0) return;

    set({ isLoading: true });
    try {
      await CustomerService.bulkActions({
        ...payloadWithoutIds,
        customerIds: selectedIds,
      });
      get().clearSelection();
      get().fetchCustomers();
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  exportSelected: () => {
    const { customers, selectedIds } = get();
    const toExport =
      selectedIds.length > 0
        ? customers.filter((c) => selectedIds.includes(c.id))
        : customers;
    CustomerService.exportCustomers(toExport);
  },
}));
