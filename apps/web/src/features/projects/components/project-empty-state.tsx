import * as React from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import { FolderKanban } from 'lucide-react';

interface ProjectEmptyStateProps {
  title?: string;
  description?: string;
  onCreateNew?: () => void;
}

export function ProjectEmptyState({
  title = 'No Projects Found',
  description = 'There are no project records matching your current filter criteria. Create your first project to get started.',
  onCreateNew,
}: ProjectEmptyStateProps) {
  return (
    <EmptyState
      icon={<FolderKanban className="h-8 w-8 text-muted-foreground" />}
      title={title}
      description={description}
      actionLabel={onCreateNew ? 'Create Your First Project' : undefined}
      onAction={onCreateNew}
    />
  );
}
