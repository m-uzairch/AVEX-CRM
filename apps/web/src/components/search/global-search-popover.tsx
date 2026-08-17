'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  History,
  Sparkles,
  Users,
  Building,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  GroupedSearchResults,
  SearchSuggestion,
  RecentSearch,
} from '@/features/search/types/search-types';
import {
  globalSearch,
  fetchSuggestions,
  fetchRecentSearches,
  clearRecentSearches,
} from '@/features/search/services/search-service';

export function GlobalSearchPopover() {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const [suggestions, setSuggestions] = React.useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = React.useState<RecentSearch[]>([]);
  const [searchResults, setSearchResults] = React.useState<GroupedSearchResults | null>(null);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Keyboard hotkey Ctrl + K / Cmd + K listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Click outside to close listener
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch recent searches when opened
  React.useEffect(() => {
    if (isOpen) {
      fetchRecentSearches()
        .then(setRecentSearches)
        .catch(() => setRecentSearches([]));
    }
  }, [isOpen]);

  // Debounce query input (300ms)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Trigger search and suggestions on debounced query change
  React.useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchResults(null);
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    Promise.all([
      globalSearch(debouncedQuery),
      fetchSuggestions(debouncedQuery),
    ])
      .then(([results, suggs]) => {
        setSearchResults(results);
        setSuggestions(suggs);
      })
      .catch(() => {
        setSearchResults(null);
        setSuggestions([]);
      })
      .finally(() => setIsLoading(false));
  }, [debouncedQuery]);

  const handleClearHistory = async () => {
    await clearRecentSearches();
    setRecentSearches([]);
  };

  const handleSelectResult = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  const handleFullSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/crm/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Search Bar Input */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search leads, customers, tags... (Ctrl + K)"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-12 bg-background/60 text-xs h-9"
        />
        <kbd className="absolute right-2.5 top-2.5 pointer-events-none hidden sm:inline-flex h-4 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-[9px]">Ctrl</span>K
        </kbd>
      </div>

      {/* Interactive Results Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute left-0 right-0 top-11 z-50 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden max-h-[480px] flex flex-col text-popover-foreground text-xs animate-in fade-in"
        >
          {/* Recent Searches (when query is empty) */}
          {!query.trim() && (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="font-bold text-[11px] uppercase tracking-wider flex items-center space-x-1">
                  <History className="h-3.5 w-3.5" />
                  <span>Recent Searches</span>
                </span>
                {recentSearches.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="text-[10px] text-muted-foreground hover:text-destructive flex items-center space-x-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>

              {recentSearches.length === 0 ? (
                <p className="text-[11px] text-muted-foreground italic py-2">
                  No recent searches recorded yet. Type a name or company to search.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setQuery(item.query)}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-muted/80 hover:bg-primary/10 hover:text-primary transition-colors text-muted-foreground"
                    >
                      {item.query}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Autocomplete Suggestions */}
          {query.trim() && suggestions.length > 0 && (
            <div className="p-2 border-b border-border/60 bg-muted/20">
              <div className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-1 flex items-center space-x-1">
                <Sparkles className="h-3 w-3 text-purple-500" />
                <span>Suggestions</span>
              </div>
              <div className="space-y-0.5">
                {suggestions.map((sugg) => (
                  <button
                    key={sugg.id}
                    type="button"
                    onClick={() => sugg.href && handleSelectResult(sugg.href)}
                    className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-accent text-foreground transition-colors"
                  >
                    <span className="font-semibold text-xs">{sugg.label}</span>
                    {sugg.sublabel && (
                      <span className="text-[10px] text-muted-foreground">{sugg.sublabel}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grouped Search Results */}
          {query.trim() && (
            <div className="flex-1 overflow-y-auto p-2 space-y-3">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  Searching records...
                </div>
              ) : !searchResults || searchResults.totalCount === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  No matching leads or customers found for &quot;{query}&quot;.
                </div>
              ) : (
                <>
                  {/* Customers Section */}
                  {searchResults.customers.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-1 flex items-center space-x-1">
                        <Users className="h-3 w-3 text-blue-500" />
                        <span>Customers ({searchResults.customers.length})</span>
                      </div>
                      {searchResults.customers.map((cust) => (
                        <div
                          key={cust.id}
                          onClick={() => handleSelectResult(cust.href)}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-foreground text-xs truncate">{cust.title}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{cust.subtitle}</p>
                          </div>
                          <Badge variant="outline" className="text-[9px] shrink-0">
                            {cust.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Leads Section */}
                  {searchResults.leads.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-1 flex items-center space-x-1">
                        <Building className="h-3 w-3 text-emerald-500" />
                        <span>Leads ({searchResults.leads.length})</span>
                      </div>
                      {searchResults.leads.map((lead) => (
                        <div
                          key={lead.id}
                          onClick={() => handleSelectResult(lead.href)}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-foreground text-xs truncate">{lead.title}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{lead.subtitle}</p>
                          </div>
                          <Badge variant="secondary" className="text-[9px] shrink-0">
                            {lead.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Popover Footer: Link to full search page */}
          {query.trim() && (
            <div className="p-2 border-t border-border bg-muted/40 text-center">
              <button
                type="button"
                onClick={handleFullSearchSubmit}
                className="w-full text-xs font-semibold text-primary hover:underline flex items-center justify-center space-x-1"
              >
                <span>View all search results for &quot;{query}&quot;</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
