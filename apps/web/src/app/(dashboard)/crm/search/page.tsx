'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CRMLayout } from '@/features/crm/layouts/crm-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Users, Building, ExternalLink } from 'lucide-react';
import { GroupedSearchResults, AdvancedFilterState } from '@/features/search/types/search-types';
import { globalSearch } from '@/features/search/services/search-service';
import { AdvancedFilterPanel } from '@/features/search/components/advanced-filter-panel';

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams?.get('q') || '';

  const [query, setQuery] = React.useState(initialQuery);
  const [activeModule, setActiveModule] = React.useState<'all' | 'customers' | 'leads'>('all');
  const [results, setResults] = React.useState<GroupedSearchResults | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const [isFilterPanelOpen, setIsFilterPanelOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<AdvancedFilterState>({});

  const executeQuery = React.useCallback(async (q: string, mod: string) => {
    if (!q.trim()) {
      setResults(null);
      return;
    }
    try {
      setIsLoading(true);
      const data = await globalSearch(q, mod);
      setResults(data);
    } catch (err: any) {
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (initialQuery) {
      executeQuery(initialQuery, activeModule);
    }
  }, [initialQuery, activeModule, executeQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeQuery(query, activeModule);
  };

  return (
    <CRMLayout
      title="Global Search Results"
      description="Unified search query results across Customers, Leads, and CRM records."
      breadcrumbs={[{ label: 'Global Search' }]}
      showToolbar={false}
    >
      <div className="space-y-6 text-xs">
        {/* Search Header Form */}
        <div className="bg-card border border-border p-4 rounded-xl space-y-4 shadow-xs">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, company, email, phone, tags, industry..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-foreground"
              />
            </div>
            <Button type="submit" size="sm" className="gap-1.5 text-xs">
              <Search className="h-3.5 w-3.5" />
              <span>Search</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFilterPanelOpen(true)}
              className="gap-1.5 text-xs"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>Advanced Filters</span>
            </Button>
          </form>

          {/* Module Filter Tabs */}
          <div className="flex border-b border-border space-x-6 pt-1">
            <button
              type="button"
              onClick={() => setActiveModule('all')}
              className={`pb-2 font-bold text-xs border-b-2 transition-colors ${
                activeModule === 'all'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              All Results ({results?.totalCount || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveModule('customers')}
              className={`pb-2 font-bold text-xs border-b-2 transition-colors ${
                activeModule === 'customers'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Customers ({results?.customers.length || 0})
            </button>

            <button
              type="button"
              onClick={() => setActiveModule('leads')}
              className={`pb-2 font-bold text-xs border-b-2 transition-colors ${
                activeModule === 'leads'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Leads ({results?.leads.length || 0})
            </button>
          </div>
        </div>

        {/* Results Body */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            Searching CRM records...
          </div>
        ) : !results || results.totalCount === 0 ? (
          <div className="p-12 border border-dashed border-border rounded-xl text-center text-xs text-muted-foreground space-y-2">
            <Search className="h-8 w-8 mx-auto opacity-40 text-primary" />
            <p className="font-bold text-foreground">No matching CRM records found</p>
            <p className="text-[11px]">Try adjusting your search terms or relaxing advanced filters.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Customers Group */}
            {(activeModule === 'all' || activeModule === 'customers') &&
              results.customers.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 font-bold text-sm text-foreground">
                    <Users className="h-4 w-4 text-blue-500" />
                    <h3>Customers ({results.customers.length})</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results.customers.map((item) => (
                      <div
                        key={item.id}
                        className="bg-card border border-border/80 p-3.5 rounded-xl hover:border-primary/40 transition-all flex items-start justify-between gap-3 shadow-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <h4 className="font-bold text-xs text-foreground truncate">{item.title}</h4>
                          <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{item.email} • {item.phone}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-2 shrink-0">
                          <Badge variant="outline" className="text-[10px]">
                            {item.status}
                          </Badge>
                          <Link href={item.href}>
                            <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1">
                              <span>View</span>
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Leads Group */}
            {(activeModule === 'all' || activeModule === 'leads') &&
              results.leads.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 font-bold text-sm text-foreground">
                    <Building className="h-4 w-4 text-emerald-500" />
                    <h3>Leads ({results.leads.length})</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {results.leads.map((item) => (
                      <div
                        key={item.id}
                        className="bg-card border border-border/80 p-3.5 rounded-xl hover:border-primary/40 transition-all flex items-start justify-between gap-3 shadow-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <h4 className="font-bold text-xs text-foreground truncate">{item.title}</h4>
                          <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{item.email} • {item.phone}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-2 shrink-0">
                          <Badge variant="secondary" className="text-[10px]">
                            {item.status}
                          </Badge>
                          <Link href={item.href}>
                            <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1">
                              <span>View</span>
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Advanced Filter Drawer */}
      <AdvancedFilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        filters={filters}
        onApplyFilters={(newFilters) => {
          setFilters(newFilters);
          executeQuery(query, activeModule);
        }}
        onResetFilters={() => {
          setFilters({});
          executeQuery(query, activeModule);
        }}
      />
    </CRMLayout>
  );
}

export default function SearchResultsPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-muted-foreground">Loading search...</div>}>
      <SearchResultsContent />
    </React.Suspense>
  );
}
