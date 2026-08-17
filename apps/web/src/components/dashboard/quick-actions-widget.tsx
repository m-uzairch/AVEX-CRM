import * as React from 'react';
import { WidgetCard } from './widget-card';
import { Button } from '@/components/ui/button';
import { UserPlus, Zap, FileText, FolderPlus, UserCheck } from 'lucide-react';

export function QuickActionsWidget() {
  return (
    <WidgetCard
      title="Quick Actions"
      description="Frequently used workspace shortcuts."
      icon={<Zap className="h-4 w-4" />}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
        <Button variant="outline" className="h-10 text-xs justify-start px-3 font-medium">
          <UserPlus className="h-3.5 w-3.5 mr-2 text-primary" />
          Add Customer
        </Button>
        <Button variant="outline" className="h-10 text-xs justify-start px-3 font-medium">
          <Zap className="h-3.5 w-3.5 mr-2 text-warning" />
          Add Lead
        </Button>
        <Button variant="outline" className="h-10 text-xs justify-start px-3 font-medium">
          <FileText className="h-3.5 w-3.5 mr-2 text-success" />
          Create Invoice
        </Button>
        <Button variant="outline" className="h-10 text-xs justify-start px-3 font-medium">
          <FolderPlus className="h-3.5 w-3.5 mr-2 text-primary" />
          Create Project
        </Button>
        <Button variant="outline" className="h-10 text-xs justify-start px-3 font-medium col-span-2 sm:col-span-1">
          <UserCheck className="h-3.5 w-3.5 mr-2 text-accent-foreground" />
          Add Employee
        </Button>
      </div>
    </WidgetCard>
  );
}
