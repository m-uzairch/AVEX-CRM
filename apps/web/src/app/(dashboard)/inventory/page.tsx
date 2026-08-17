import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { EmptyState } from '@/components/ui/empty-state';
import { Package } from 'lucide-react';

export default function InventoryPage() {
  return (
    <ContentContainer>
      <PageHeader
        title="Inventory & Products"
        description="Track product catalog, stock levels, warehouse inventory, and suppliers."
        breadcrumbs={[{ label: 'Inventory' }]}
      />
      <EmptyState
        icon={<Package className="h-6 w-6" />}
        title="Inventory Module Foundation Ready"
        description="Inventory management features will be enabled during the dedicated Inventory sprint task."
      />
    </ContentContainer>
  );
}
