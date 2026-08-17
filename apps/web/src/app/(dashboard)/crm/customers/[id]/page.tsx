'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CRMLayout } from '@/features/crm/layouts/crm-layout';
import { CustomerService } from '@/features/crm/services/customer-service';
import { Customer, CustomerSummaryStats } from '@/features/crm/types/customer-types';
import { CustomerOverviewTab } from '@/features/crm/components/customers/customer-overview-tab';
import { CustomerNotesSection } from '@/features/crm/components/customers/customer-notes-section';
import { CustomerActivityTimeline } from '@/features/crm/components/customers/customer-activity-timeline';
import {
  CustomerProjectsTab,
  CustomerInvoicesTab,
  CustomerFilesTab,
  CustomerMeetingsTab,
} from '@/features/crm/components/customers/customer-placeholders';
import { CustomerFormModal } from '@/features/crm/components/customers/customer-form-modal';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Building2,
  Mail,
  Phone,
  Edit,
  Archive,
  Trash2,
  RotateCcw,
  MessageSquare,
  Activity,
  ArrowLeft,
  LayoutDashboard,
  FolderKanban,
  FileSpreadsheet,
  FileText,
  Calendar,
  Sparkles,
  ChevronDown,
  DollarSign,
  UserCheck,
  Search,
  Send,
  MessageCircle,
  PlusCircle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ProfileTabType = 'overview' | 'notes' | 'activity' | 'projects' | 'invoices' | 'files' | 'meetings';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [customer, setCustomer] = React.useState<Customer | null>(null);
  const [summaryStats, setSummaryStats] = React.useState<CustomerSummaryStats | null>(null);
  const [activeTab, setActiveTab] = React.useState<ProfileTabType>('overview');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = React.useState(false);
  const [globalProfileSearch, setGlobalProfileSearch] = React.useState('');

  const loadCustomer = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await CustomerService.getCustomerById(id);
      const stats = await CustomerService.getSummaryStats(id);
      setCustomer(data);
      setSummaryStats(stats);
    } catch {
      // Catch error
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    if (id) {
      loadCustomer();
    }
  }, [id, loadCustomer]);

  if (isLoading) {
    return (
      <CRMLayout title="Customer Details" breadcrumbs={[{ label: 'Customers', href: '/crm/customers' }, { label: 'Loading Profile...' }]}>
        <div className="flex justify-center p-16">
          <Spinner />
        </div>
      </CRMLayout>
    );
  }

  if (!customer) {
    return (
      <CRMLayout title="Customer Not Found" breadcrumbs={[{ label: 'Customers', href: '/crm/customers' }, { label: 'Not Found' }]}>
        <div className="p-12 text-center space-y-4">
          <p className="text-sm text-muted-foreground">The requested customer record could not be found or has been permanently removed.</p>
          <Button variant="outline" size="sm" onClick={() => router.push('/crm/customers')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Return to Customer Directory
          </Button>
        </div>
      </CRMLayout>
    );
  }

  const initials = customer.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const handleArchiveToggle = async () => {
    if (customer.isArchived) {
      await CustomerService.unarchiveCustomer(customer.id);
    } else {
      await CustomerService.archiveCustomer(customer.id);
    }
    loadCustomer();
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to move this customer account to Trash?')) {
      await CustomerService.deleteCustomer(customer.id);
      router.push('/crm/customers');
    }
  };

  const handleRestore = async () => {
    await CustomerService.restoreCustomer(customer.id);
    loadCustomer();
  };

  const handleQuickAction = (actionName: string) => {
    setIsQuickActionsOpen(false);
    alert(`Quick Action Triggered: "${actionName}" for customer ${customer.name}.`);
  };

  return (
    <CRMLayout
      title={customer.name}
      description={`360° Customer Profile • Account #${customer.id.substring(0, 8)}`}
      breadcrumbs={[
        { label: 'Customers', href: '/crm/customers' },
        { label: customer.name },
      ]}
      headerActions={
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <Button variant="outline" size="sm" onClick={() => router.push('/crm/customers')} className="h-9 px-3 text-xs border-border">
            <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
          </Button>

          {!customer.deletedAt && (
            <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)} className="h-9 px-3 text-xs border-border">
              <Edit className="h-3.5 w-3.5 mr-1" /> Edit Profile
            </Button>
          )}

          {!customer.deletedAt && (
            <Button variant="outline" size="sm" onClick={handleArchiveToggle} className="h-9 px-3 text-xs border-border">
              <Archive className="h-3.5 w-3.5 mr-1 text-amber-500" />
              <span>{customer.isArchived ? 'Unarchive' : 'Archive'}</span>
            </Button>
          )}

          {customer.deletedAt ? (
            <Button size="sm" onClick={handleRestore} className="h-9 px-3 text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Restore Customer
            </Button>
          ) : (
            <Button variant="destructive" size="sm" onClick={handleDelete} className="h-9 px-3 text-xs">
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Trash
            </Button>
          )}

          {/* Quick Actions Dropdown */}
          {!customer.deletedAt && (
            <div className="relative">
              <Button
                size="sm"
                onClick={() => setIsQuickActionsOpen((prev) => !prev)}
                className="h-9 px-3 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-300" />
                <span>Quick Actions</span>
                <ChevronDown className="h-3.5 w-3.5 ml-1" />
              </Button>

              {isQuickActionsOpen && (
                <div className="absolute right-0 mt-1 w-52 rounded-md border border-border bg-popover p-1 shadow-md z-50 text-xs">
                  <button
                    onClick={() => handleQuickAction('Create Lead')}
                    className="flex w-full items-center px-2.5 py-2 text-left hover:bg-accent rounded-sm"
                  >
                    <PlusCircle className="h-3.5 w-3.5 mr-2 text-blue-500" /> Create Lead
                  </button>
                  <button
                    onClick={() => handleQuickAction('Create Project')}
                    className="flex w-full items-center px-2.5 py-2 text-left hover:bg-accent rounded-sm"
                  >
                    <FolderKanban className="h-3.5 w-3.5 mr-2 text-purple-500" /> Create Project
                  </button>
                  <button
                    onClick={() => handleQuickAction('Generate Invoice')}
                    className="flex w-full items-center px-2.5 py-2 text-left hover:bg-accent rounded-sm"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 mr-2 text-emerald-500" /> Generate Invoice
                  </button>
                  <button
                    onClick={() => handleQuickAction('Schedule Meeting')}
                    className="flex w-full items-center px-2.5 py-2 text-left hover:bg-accent rounded-sm"
                  >
                    <Calendar className="h-3.5 w-3.5 mr-2 text-amber-500" /> Schedule Meeting
                  </button>
                  <div className="my-1 border-t border-border" />
                  <button
                    onClick={() => handleQuickAction('Send Email')}
                    className="flex w-full items-center px-2.5 py-2 text-left hover:bg-accent rounded-sm"
                  >
                    <Send className="h-3.5 w-3.5 mr-2 text-primary" /> Send Email
                  </button>
                  <button
                    onClick={() => handleQuickAction('Send WhatsApp Message')}
                    className="flex w-full items-center px-2.5 py-2 text-left hover:bg-accent rounded-sm"
                  >
                    <MessageCircle className="h-3.5 w-3.5 mr-2 text-emerald-600" /> Send WhatsApp Message
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      }
    >
      {/* Customer Header Banner */}
      <Card className="shadow-xs border-border mb-6 overflow-hidden">
        <CardContent className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Avatar & Key Metadata */}
          <div className="flex items-start sm:items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 text-primary font-bold text-xl flex items-center justify-center shrink-0 border-2 border-primary/20 shadow-xs">
              {initials}
            </div>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h2 className="text-xl font-bold text-foreground">{customer.name}</h2>
                <Badge variant={customer.status === 'ACTIVE' ? 'default' : 'outline'} className="text-xs">
                  {customer.status}
                </Badge>
                <Badge
                  variant={customer.priority === 'HIGH' || customer.priority === 'URGENT' ? 'destructive' : 'secondary'}
                  className="text-xs uppercase"
                >
                  {customer.priority} Priority
                </Badge>
                {customer.isArchived && <Badge variant="secondary" className="text-xs">Archived</Badge>}
                {customer.deletedAt && <Badge variant="destructive" className="text-xs">In Trash</Badge>}
              </div>

              <div className="flex items-center space-x-3 text-xs text-muted-foreground flex-wrap gap-y-1">
                <span className="flex items-center font-medium text-foreground">
                  <Building2 className="h-3.5 w-3.5 mr-1 text-muted-foreground" /> {customer.companyName}
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Mail className="h-3.5 w-3.5 mr-1" /> {customer.email}
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Phone className="h-3.5 w-3.5 mr-1" /> {customer.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Employee & Lifecycle Metadata Badge */}
          <div className="flex flex-wrap items-center gap-4 text-xs border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-6">
            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">Assigned Manager</span>
              <span className="font-bold text-foreground flex items-center space-x-1">
                <UserCheck className="h-3.5 w-3.5 text-blue-500" />
                <span>{customer.assignedEmployeeName || 'Alex Carter'}</span>
              </span>
            </div>

            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">Customer Since</span>
              <span className="font-semibold text-foreground flex items-center space-x-1">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{new Date(customer.createdAt).toLocaleDateString()}</span>
              </span>
            </div>

            <div>
              <span className="text-[11px] text-muted-foreground block font-medium">Last Updated</span>
              <span className="font-semibold text-foreground flex items-center space-x-1">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{new Date(customer.updatedAt).toLocaleDateString()}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Quick Summary Statistics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <div className="p-3.5 rounded-lg border border-border bg-card shadow-2xs space-y-1">
          <span className="text-[11px] text-muted-foreground block font-medium flex items-center space-x-1">
            <FolderKanban className="h-3 w-3 text-blue-500" />
            <span>Total Projects</span>
          </span>
          <span className="text-lg font-bold text-foreground">{summaryStats?.totalProjects || 2}</span>
        </div>

        <div className="p-3.5 rounded-lg border border-border bg-card shadow-2xs space-y-1">
          <span className="text-[11px] text-muted-foreground block font-medium flex items-center space-x-1">
            <FileSpreadsheet className="h-3 w-3 text-emerald-500" />
            <span>Total Invoices</span>
          </span>
          <span className="text-lg font-bold text-foreground">{summaryStats?.totalInvoices || 2}</span>
        </div>

        <div className="p-3.5 rounded-lg border border-border bg-card shadow-2xs space-y-1">
          <span className="text-[11px] text-muted-foreground block font-medium flex items-center space-x-1">
            <DollarSign className="h-3 w-3 text-emerald-600" />
            <span>Total Payments</span>
          </span>
          <span className="text-lg font-bold text-foreground">${(summaryStats?.totalPaymentsAmount || 14500).toLocaleString()}</span>
        </div>

        <div className="p-3.5 rounded-lg border border-border bg-card shadow-2xs space-y-1">
          <span className="text-[11px] text-muted-foreground block font-medium flex items-center space-x-1">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span>Open Leads</span>
          </span>
          <span className="text-lg font-bold text-foreground">{summaryStats?.openLeads || 1}</span>
        </div>

        <div className="p-3.5 rounded-lg border border-border bg-card shadow-2xs space-y-1 col-span-2 md:col-span-1">
          <span className="text-[11px] text-muted-foreground block font-medium flex items-center space-x-1">
            <Clock className="h-3 w-3 text-purple-500" />
            <span>Last Contact</span>
          </span>
          <span className="text-xs font-bold text-foreground mt-1 block">
            {summaryStats?.lastContactDate ? new Date(summaryStats.lastContactDate).toLocaleDateString() : 'Recent'}
          </span>
        </div>
      </div>

      {/* 7 Tab Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border bg-card/50 rounded-t-lg px-2 gap-3 mb-6">
        <div className="flex items-center overflow-x-auto no-scrollbar space-x-1 text-xs font-medium py-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              'flex items-center space-x-1.5 py-2.5 px-3.5 border-b-2 transition-colors rounded-t-md font-semibold whitespace-nowrap',
              activeTab === 'overview'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
            )}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={cn(
              'flex items-center space-x-1.5 py-2.5 px-3.5 border-b-2 transition-colors rounded-t-md font-semibold whitespace-nowrap',
              activeTab === 'notes'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
            )}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Notes</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={cn(
              'flex items-center space-x-1.5 py-2.5 px-3.5 border-b-2 transition-colors rounded-t-md font-semibold whitespace-nowrap',
              activeTab === 'activity'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
            )}
          >
            <Activity className="h-3.5 w-3.5 text-purple-500" />
            <span>Activity</span>
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={cn(
              'flex items-center space-x-1.5 py-2.5 px-3.5 border-b-2 transition-colors rounded-t-md font-semibold whitespace-nowrap',
              activeTab === 'projects'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
            )}
          >
            <FolderKanban className="h-3.5 w-3.5 text-blue-500" />
            <span>Projects</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={cn(
              'flex items-center space-x-1.5 py-2.5 px-3.5 border-b-2 transition-colors rounded-t-md font-semibold whitespace-nowrap',
              activeTab === 'invoices'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
            )}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
            <span>Invoices</span>
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={cn(
              'flex items-center space-x-1.5 py-2.5 px-3.5 border-b-2 transition-colors rounded-t-md font-semibold whitespace-nowrap',
              activeTab === 'files'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
            )}
          >
            <FileText className="h-3.5 w-3.5 text-amber-500" />
            <span>Files</span>
          </button>

          <button
            onClick={() => setActiveTab('meetings')}
            className={cn(
              'flex items-center space-x-1.5 py-2.5 px-3.5 border-b-2 transition-colors rounded-t-md font-semibold whitespace-nowrap',
              activeTab === 'meetings'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
            )}
          >
            <Calendar className="h-3.5 w-3.5 text-purple-400" />
            <span>Meetings</span>
          </button>
        </div>

        {/* Global Profile Search Bar */}
        {(activeTab === 'notes' || activeTab === 'activity') && (
          <div className="relative pb-2 md:pb-0 w-full md:w-60 my-auto">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={globalProfileSearch}
              onChange={(e) => setGlobalProfileSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-md border border-border bg-background text-xs focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>
        )}
      </div>

      {/* Tab Render Switcher */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <CustomerOverviewTab customer={customer} onCustomerUpdated={loadCustomer} />
        )}
        {activeTab === 'notes' && (
          <CustomerNotesSection customerId={customer.id} searchQuery={globalProfileSearch} />
        )}
        {activeTab === 'activity' && (
          <CustomerActivityTimeline customerId={customer.id} searchQuery={globalProfileSearch} />
        )}
        {activeTab === 'projects' && (
          <CustomerProjectsTab customerId={customer.id} />
        )}
        {activeTab === 'invoices' && (
          <CustomerInvoicesTab customerId={customer.id} />
        )}
        {activeTab === 'files' && (
          <CustomerFilesTab customerId={customer.id} />
        )}
        {activeTab === 'meetings' && (
          <CustomerMeetingsTab customerId={customer.id} />
        )}
      </div>

      {/* Edit Customer Form Modal */}
      <CustomerFormModal
        isOpen={isEditOpen}
        mode="edit"
        initialData={customer}
        onClose={() => setIsEditOpen(false)}
        onSubmit={async (values) => {
          await CustomerService.updateCustomer(customer.id, values);
          setIsEditOpen(false);
          loadCustomer();
        }}
      />
    </CRMLayout>
  );
}
