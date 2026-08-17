'use client';

import * as React from 'react';
import { ContentContainer } from '@/components/layout/content-container';
import { PageHeader } from '@/components/layout/page-header';
import { ProjectWizard } from '@/features/projects/components/project-wizard';
import { fetchProjectCategories } from '@/features/projects/services/project-service';
import { ProjectCategory } from '@/features/projects/types/project-types';

export default function NewProjectPage() {
  const [categories, setCategories] = React.useState<ProjectCategory[]>([]);

  React.useEffect(() => {
    fetchProjectCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  return (
    <ContentContainer>
      <PageHeader
        title="Create New Project"
        description="Establish a new project workspace with automated project code generation, template pre-fill, and milestone structures."
        breadcrumbs={[
          { label: 'Projects', href: '/projects' },
          { label: 'New Project' },
        ]}
      />

      <div className="max-w-4xl mx-auto py-4">
        <ProjectWizard categories={categories} />
      </div>
    </ContentContainer>
  );
}
