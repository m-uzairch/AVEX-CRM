export type SearchModuleType = 'customers' | 'leads' | 'all';

export interface SearchResultItem {
  id: string;
  module: 'customers' | 'leads';
  title: string; // Name
  subtitle: string; // Company Name
  email: string;
  phone: string;
  status: string;
  priority?: string;
  score?: number;
  tags?: string[];
  href: string; // Link to profile details page
}

export interface GroupedSearchResults {
  query: string;
  totalCount: number;
  customers: SearchResultItem[];
  leads: SearchResultItem[];
}

export interface SearchSuggestion {
  id: string;
  type: 'customer' | 'lead' | 'company' | 'tag';
  label: string;
  sublabel?: string;
  href?: string;
}

export interface Tag {
  id: string;
  companyId: string;
  name: string;
  color: string; // Hex color string e.g. #3B82F6
  description?: string | null;
  usageCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SavedFilter {
  id: string;
  companyId: string;
  userId: string;
  module: string; // 'LEADS' | 'CUSTOMERS' | 'ALL'
  name: string;
  filterConfig: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface RecentSearch {
  id: string;
  query: string;
  createdAt: string;
}

export interface BulkTagOperationPayload {
  entityType: 'LEAD' | 'CUSTOMER';
  entityIds: string[];
  action: 'ADD' | 'REMOVE' | 'REPLACE';
  tags: string[];
}

export interface AdvancedFilterState {
  search?: string;
  status?: string;
  priority?: string;
  assignedEmployeeId?: string;
  source?: string;
  industry?: string;
  tags?: string[];
  minScore?: number;
  maxScore?: number;
  startDate?: string;
  endDate?: string;
}
