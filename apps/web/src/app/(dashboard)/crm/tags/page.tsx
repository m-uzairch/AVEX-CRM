'use client';

import * as React from 'react';
import { CRMLayout } from '@/features/crm/layouts/crm-layout';
import { Tag } from '@/features/search/types/search-types';
import { fetchTags } from '@/features/search/services/search-service';
import { TagManagementTable } from '@/features/search/components/tag-management-table';

export default function SmartTagManagementPage() {
  const [tags, setTags] = React.useState<Tag[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadTags = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchTags();
      setTags(data);
    } catch (err: any) {
      console.error('Failed to load tags:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadTags();
  }, [loadTags]);

  return (
    <CRMLayout
      title="Smart Tag Management"
      description="Define custom workspace tags, colors, descriptions, and track record usage counts."
      breadcrumbs={[
        { label: 'CRM Settings' },
        { label: 'Tags' },
      ]}
      showToolbar={false}
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-muted-foreground">
            Loading tags...
          </div>
        ) : (
          <TagManagementTable tags={tags} onRefresh={loadTags} />
        )}
      </div>
    </CRMLayout>
  );
}
