import {
  GroupedSearchResults,
  SearchSuggestion,
  Tag,
  SavedFilter,
  RecentSearch,
  BulkTagOperationPayload,
} from '../types/search-types';
import { CreateTagInput, SavedFilterInput } from '../schemas/search-schemas';

export async function globalSearch(
  query: string,
  module: string = 'all'
): Promise<GroupedSearchResults> {
  if (!query.trim()) {
    return { query: '', totalCount: 0, customers: [], leads: [] };
  }

  const res = await fetch(
    `/api/search?q=${encodeURIComponent(query)}&module=${module}`
  );
  if (!res.ok) {
    throw new Error('Failed to execute search query.');
  }

  return res.json();
}

export async function fetchSuggestions(query: string): Promise<SearchSuggestion[]> {
  if (!query.trim() || query.length < 2) return [];

  const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];

  const data = await res.json();
  return data.suggestions || [];
}

export async function fetchRecentSearches(): Promise<RecentSearch[]> {
  const res = await fetch('/api/search/recent');
  if (!res.ok) return [];
  const data = await res.json();
  return data.searches || [];
}

export async function clearRecentSearches(): Promise<void> {
  await fetch('/api/search/recent', { method: 'DELETE' });
}

export async function fetchTags(): Promise<Tag[]> {
  const res = await fetch('/api/search/tags');
  if (!res.ok) return [];
  const data = await res.json();
  return data.tags || [];
}

export async function createTag(data: CreateTagInput): Promise<Tag> {
  const res = await fetch('/api/search/tags', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create tag');
  }

  const result = await res.json();
  return result.tag;
}

export async function updateTag(
  tagId: string,
  data: Partial<CreateTagInput>
): Promise<Tag> {
  const res = await fetch(`/api/search/tags/${tagId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update tag');
  }

  const result = await res.json();
  return result.tag;
}

export async function deleteTag(tagId: string): Promise<void> {
  const res = await fetch(`/api/search/tags/${tagId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to delete tag');
  }
}

export async function fetchSavedFilters(module: string = 'ALL'): Promise<SavedFilter[]> {
  const res = await fetch(`/api/search/saved-filters?module=${module}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data.filters || [];
}

export async function createSavedFilter(data: SavedFilterInput): Promise<SavedFilter> {
  const res = await fetch('/api/search/saved-filters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to save filter preset');
  }

  const result = await res.json();
  return result.filter;
}

export async function deleteSavedFilter(filterId: string): Promise<void> {
  await fetch(`/api/search/saved-filters/${filterId}`, {
    method: 'DELETE',
  });
}

export async function executeBulkTagOperation(
  payload: BulkTagOperationPayload
): Promise<void> {
  const res = await fetch('/api/search/tags/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to execute bulk tag operation');
  }
}
