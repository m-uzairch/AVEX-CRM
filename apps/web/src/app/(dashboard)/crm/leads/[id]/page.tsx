'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { CRMLayout } from '@/features/crm/layouts/crm-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UserCheck,
  Edit,
  Archive,
  Trash2,
  ChevronLeft,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  User,
  MessageSquare,
  Activity,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { Lead } from '@/features/crm/types/lead-types';
import {
  fetchLeadById,
  updateLead,
  deleteLead,
  archiveLead,
  convertLeadToCustomer,
} from '@/features/crm/services/lead-service';
import { LeadScoreBadge } from '@/features/crm/components/leads/lead-score-badge';
import { LeadNotesSection } from '@/features/crm/components/leads/lead-notes-section';
import { LeadActivityTimeline } from '@/features/crm/components/leads/lead-activity-timeline';
import { LeadFormModal } from '@/features/crm/components/leads/lead-form-modal';
import { LeadConvertModal } from '@/features/crm/components/leads/lead-convert-modal';

export default function LeadDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [lead, setLead] = React.useState<Lead | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'notes' | 'activity'>('overview');

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = React.useState(false);

  const loadLead = React.useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await fetchLeadById(id);
      setLead(data);
    } catch (err: any) {
      console.error('Failed to load lead details:', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadLead();
  }, [loadLead]);

  const handleConvert = async (payload: { customerStatus?: string; notes?: string }) => {
    if (!lead) return;
    const res = await convertLeadToCustomer(lead.id, payload);
    await loadLead();
    if (res.customerId) {
      alert(`Lead converted successfully! Customer ID: ${res.customerId}`);
    }
  };

  const handleArchive = async () => {
    if (!lead) return;
    await archiveLead(lead.id, !lead.isArchived);
    await loadLead();
  };

  const handleDelete = async () => {
    if (!lead) return;
    if (confirm(`Are you sure you want to delete lead ${lead.name}?`)) {
      await deleteLead(lead.id);
      router.push('/crm/leads');
    }
  };

  if (isLoading) {
    return (
      <CRMLayout title="Lead Profile" description="Loading lead information...">
        <div className="p-12 text-center text-muted-foreground text-xs">
          Loading lead record...
        </div>
      </CRMLayout>
    );
  }

  if (!lead) {
    return (
      <CRMLayout title="Lead Not Found" description="The requested lead profile could not be found.">
        <div className="p-12 text-center space-y-4">
          <p className="text-muted-foreground text-xs">This lead record may have been deleted or archived.</p>
          <Link href="/crm/leads">
            <Button size="sm">Return to Leads</Button>
          </Link>
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout
      title={`Lead: ${lead.name}`}
      description={`${lead.companyName} • Captured on ${new Date(lead.createdAt).toLocaleDateString()}`}
      breadcrumbs={[
        { label: 'Leads', href: '/crm/leads' },
        { label: lead.name },
      ]}
      showToolbar={false}
    >
      <div className="space-y-6 text-xs">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-4 rounded-xl">
          <Link href="/crm/leads">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Leads Table</span>
            </Button>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {!lead.isConverted ? (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs"
                onClick={() => setIsConvertModalOpen(true)}
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Convert to Customer</span>
              </Button>
            ) : (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs px-3 py-1 gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>Converted to Customer</span>
              </Badge>
            )}

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit className="h-3.5 w-3.5 text-blue-500" />
              <span>Edit Lead</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={handleArchive}
            >
              <Archive className="h-3.5 w-3.5 text-amber-500" />
              <span>{lead.isArchived ? 'Unarchive' : 'Archive'}</span>
            </Button>

            <Button
              variant="destructive"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </Button>
          </div>
        </div>

        {/* Lead Summary Overview Header Card */}
        <div className="bg-gradient-to-r from-card via-card to-muted/30 border border-border p-6 rounded-xl space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary font-extrabold text-xl flex items-center justify-center border border-primary/20 shrink-0 shadow-sm">
                {lead.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-bold text-foreground">{lead.name}</h1>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono">
                    {lead.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center space-x-1.5 mt-0.5">
                  <Building className="h-3.5 w-3.5" />
                  <span className="font-medium text-foreground">{lead.companyName}</span>
                  <span>•</span>
                  <span>Source: {lead.source}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <LeadScoreBadge score={lead.score} size="lg" />

              <div className="text-right border-l border-border/80 pl-4">
                <span className="text-[10px] uppercase text-muted-foreground block font-medium">
                  Expected Deal Value
                </span>
                <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                  ${(lead.expectedDealValue || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick info row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-border/60 text-xs">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate">{lead.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{lead.phone}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <User className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Assigned: {lead.assignedEmployee?.fullName || 'Unassigned'}</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>
                Target Date:{' '}
                {lead.expectedClosingDate
                  ? new Date(lead.expectedClosingDate).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border space-x-4">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-2 text-xs font-semibold flex items-center space-x-1.5 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building className="h-4 w-4" />
            <span>Lead Profile & Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`pb-2 text-xs font-semibold flex items-center space-x-1.5 border-b-2 transition-colors ${
              activeTab === 'notes'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Internal Notes ({lead.notes?.length || 0})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`pb-2 text-xs font-semibold flex items-center space-x-1.5 border-b-2 transition-colors ${
              activeTab === 'activity'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Activity Timeline ({lead.activityLogs?.length || 0})</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Profile Card */}
            <div className="bg-card border border-border p-5 rounded-xl space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
                <Building className="h-4 w-4 text-primary" />
                <span>Business & Company Information</span>
              </h3>
              <div className="space-y-2.5 divide-y divide-border/60">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Industry</span>
                  <span className="font-medium text-foreground">{lead.industry || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Business Type</span>
                  <span className="font-medium text-foreground">{lead.businessType || 'DIGITAL'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Website</span>
                  <span className="font-medium text-primary">
                    {lead.website ? (
                      <a href={lead.website} target="_blank" rel="noreferrer" className="underline">
                        {lead.website}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Company Size</span>
                  <span className="font-medium text-foreground">{lead.companySize || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Address Card */}
            <div className="bg-card border border-border p-5 rounded-xl space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Address & Location</span>
              </h3>
              <div className="space-y-2.5 divide-y divide-border/60">
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Country</span>
                  <span className="font-medium text-foreground">{lead.country || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">State / City</span>
                  <span className="font-medium text-foreground">
                    {[lead.state, lead.city].filter(Boolean).join(', ') || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Street Address</span>
                  <span className="font-medium text-foreground">{lead.address || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Postal Code</span>
                  <span className="font-medium text-foreground">{lead.postalCode || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Tags Card */}
            <div className="md:col-span-2 bg-card border border-border p-5 rounded-xl space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
                <Tag className="h-4 w-4 text-primary" />
                <span>Tags & Classifications</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {lead.tags && lead.tags.length > 0 ? (
                  lead.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold"
                    >
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground text-xs italic">No tags assigned.</span>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <LeadNotesSection leadId={lead.id} initialNotes={lead.notes} />
        )}

        {activeTab === 'activity' && (
          <LeadActivityTimeline logs={lead.activityLogs} />
        )}
      </div>

      {/* Edit Modal */}
      <LeadFormModal
        isOpen={isEditModalOpen}
        lead={lead}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={async (values) => {
          await updateLead(lead.id, values);
          await loadLead();
        }}
      />

      {/* Convert Modal */}
      <LeadConvertModal
        isOpen={isConvertModalOpen}
        lead={lead}
        onClose={() => setIsConvertModalOpen(false)}
        onConfirm={handleConvert}
      />
    </CRMLayout>
  );
}
