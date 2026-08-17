'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { X, UserPlus, Flame, Tag, Plus, Check } from 'lucide-react';
import { Lead, LeadFormValues } from '../../types/lead-types';
import { defaultLeadSources } from '../../services/lead-service';
import { LeadScoreBadge } from './lead-score-badge';

interface LeadFormModalProps {
  isOpen: boolean;
  lead?: Lead | null;
  employees?: Array<{ id: string; fullName: string; email: string }>;
  onClose: () => void;
  onSubmit: (values: LeadFormValues) => Promise<void>;
}

const defaultTags = [
  'Hot Lead',
  'Warm Lead',
  'Cold Lead',
  'Enterprise',
  'Startup',
  'High Value',
  'Follow Up',
  'Qualified',
];

export function LeadFormModal({
  isOpen,
  lead,
  employees = [],
  onClose,
  onSubmit,
}: LeadFormModalProps) {
  const isEditing = Boolean(lead);

  const [form, setForm] = React.useState<LeadFormValues>({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    country: '',
    state: '',
    city: '',
    address: '',
    postalCode: '',
    industry: '',
    businessType: 'DIGITAL',
    website: '',
    companySize: '',
    source: 'Website',
    status: 'NEW',
    priority: 'MEDIUM',
    score: 50,
    assignedEmployeeId: '',
    expectedDealValue: 0,
    expectedClosingDate: '',
    tags: [],
  });

  const [customTagInput, setCustomTagInput] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  React.useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name || '',
        companyName: lead.companyName || '',
        email: lead.email || '',
        phone: lead.phone || '',
        alternatePhone: lead.alternatePhone || '',
        country: lead.country || '',
        state: lead.state || '',
        city: lead.city || '',
        address: lead.address || '',
        postalCode: lead.postalCode || '',
        industry: lead.industry || '',
        businessType: lead.businessType || 'DIGITAL',
        website: lead.website || '',
        companySize: lead.companySize || '',
        source: lead.source || 'Website',
        status: lead.status || 'NEW',
        priority: lead.priority || 'MEDIUM',
        score: lead.score ?? 50,
        assignedEmployeeId: lead.assignedEmployeeId || '',
        expectedDealValue: lead.expectedDealValue || 0,
        expectedClosingDate: lead.expectedClosingDate
          ? new Date(lead.expectedClosingDate).toISOString().split('T')[0]
          : '',
        tags: lead.tags || [],
      });
    } else {
      setForm({
        name: '',
        companyName: '',
        email: '',
        phone: '',
        alternatePhone: '',
        country: '',
        state: '',
        city: '',
        address: '',
        postalCode: '',
        industry: 'Software & Technology',
        businessType: 'DIGITAL',
        website: '',
        companySize: '10-50 employees',
        source: 'Website',
        status: 'NEW',
        priority: 'MEDIUM',
        score: 50,
        assignedEmployeeId: '',
        expectedDealValue: 0,
        expectedClosingDate: '',
        tags: ['New Lead'],
      });
    }
    setErrorMsg('');
  }, [lead, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const toggleTag = (tag: string) => {
    setForm((prev) => {
      const exists = prev.tags.includes(tag);
      return {
        ...prev,
        tags: exists ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
      };
    });
  };

  const addCustomTag = () => {
    const trimmed = customTagInput.trim();
    if (trimmed && !form.tags.includes(trimmed)) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, trimmed] }));
      setCustomTagInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.name || !form.companyName || !form.email || !form.phone) {
      setErrorMsg('Please fill in all mandatory fields (Name, Company, Email, Phone).');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(form);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save lead record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-card border border-border w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden text-card-foreground flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold">
              {isEditing ? `Edit Lead: ${lead?.name}` : 'Add New Business Lead'}
            </h2>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {errorMsg && (
            <div className="p-3 bg-destructive/10 border border-destructive/30 text-destructive rounded-md">
              {errorMsg}
            </div>
          )}

          {/* Section 1: Basic Info */}
          <div>
            <h3 className="font-semibold text-primary uppercase text-[11px] tracking-wider mb-3">
              1. Basic Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="font-medium text-foreground block mb-1">
                  Lead Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. David Miller"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full text-xs p-2 rounded-md border border-input bg-background"
                />
              </div>
              <div>
                <label className="font-medium text-foreground block mb-1">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  required
                  placeholder="e.g. Nexus Software"
                  value={form.companyName}
                  onChange={handleChange}
                  className="w-full text-xs p-2 rounded-md border border-input bg-background"
                />
              </div>
              <div>
                <label className="font-medium text-foreground block mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="david@nexus.dev"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full text-xs p-2 rounded-md border border-input bg-background"
                />
              </div>
              <div>
                <label className="font-medium text-foreground block mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  required
                  placeholder="+1 (555) 234-5678"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full text-xs p-2 rounded-md border border-input bg-background"
                />
              </div>
              <div className="md:col-span-2">
                <label className="font-medium text-foreground block mb-1">
                  Alternate Phone (Optional)
                </label>
                <input
                  type="text"
                  name="alternatePhone"
                  placeholder="+1 (555) 987-6543"
                  value={form.alternatePhone}
                  onChange={handleChange}
                  className="w-full text-xs p-2 rounded-md border border-input bg-background"
                />
              </div>
            </div>
          </div>

          {/* Section 2: CRM & Qualification */}
          <div>
            <h3 className="font-semibold text-primary uppercase text-[11px] tracking-wider mb-3">
              2. CRM & Lead Qualification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="font-medium text-foreground block mb-1">Lead Source</label>
                <select
                  name="source"
                  value={form.source}
                  onChange={handleChange}
                  className="w-full text-xs p-2 rounded-md border border-input bg-background"
                >
                  {defaultLeadSources.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Lead Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full text-xs p-2 rounded-md border border-input bg-background"
                >
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="PROPOSAL_SENT">Proposal Sent</option>
                  <option value="NEGOTIATION">Negotiation</option>
                  <option value="WON">Won (Converted)</option>
                  <option value="LOST">Lost</option>
                </select>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Priority</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="w-full text-xs p-2 rounded-md border border-input bg-background"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              {/* Lead Score Slider & Badge */}
              <div className="md:col-span-3 bg-muted/40 p-3 rounded-lg border border-border/80 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground flex items-center space-x-1.5">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span>Lead Score Qualification (0 - 100)</span>
                  </label>
                  <p className="text-[11px] text-muted-foreground">
                    Adjust manual lead score based on deal readiness and interest level.
                  </p>
                </div>
                <div className="flex items-center space-x-3 w-full md:w-auto">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    name="score"
                    value={form.score}
                    onChange={handleChange}
                    className="w-36 h-2 bg-input rounded-lg appearance-none cursor-pointer"
                  />
                  <LeadScoreBadge score={form.score} size="md" />
                </div>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Assigned Employee</label>
                <select
                  name="assignedEmployeeId"
                  value={form.assignedEmployeeId}
                  onChange={handleChange}
                  className="w-full text-xs p-2 rounded-md border border-input bg-background"
                >
                  <option value="">Unassigned</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Expected Deal Value ($)</label>
                <input
                  type="number"
                  name="expectedDealValue"
                  placeholder="15000"
                  value={form.expectedDealValue}
                  onChange={handleChange}
                  className="w-full text-xs p-2 rounded-md border border-input bg-background"
                />
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">Expected Closing Date</label>
                <input
                  type="date"
                  name="expectedClosingDate"
                  value={form.expectedClosingDate}
                  onChange={handleChange}
                  className="w-full text-xs p-2 rounded-md border border-input bg-background"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Business Information */}
          <div>
            <h3 className="font-semibold text-primary uppercase text-[11px] tracking-wider mb-3">
              3. Business Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="font-medium text-foreground block mb-1">Industry</label>
                <input
                  type="text"
                  name="industry"
                  placeholder="Software / Fintech / Marketing"
                  value={form.industry}
                  onChange={handleChange}
                  className="w-full text-xs p-2 rounded-md border border-input bg-background"
                />
              </div>
              <div>
                <label className="font-medium text-foreground block mb-1">Business Type</label>
                <select
                  name="businessType"
                  value={form.businessType}
                  onChange={handleChange}
                  className="w-full text-xs p-2 rounded-md border border-input bg-background"
                >
                  <option value="DIGITAL">Digital / Software</option>
                  <option value="PHYSICAL">Physical / Retail</option>
                  <option value="BOTH">Hybrid (Both)</option>
                </select>
              </div>
              <div>
                <label className="font-medium text-foreground block mb-1">Website URL</label>
                <input
                  type="url"
                  name="website"
                  placeholder="https://company.com"
                  value={form.website}
                  onChange={handleChange}
                  className="w-full text-xs p-2 rounded-md border border-input bg-background"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Address */}
          <div>
            <h3 className="font-semibold text-primary uppercase text-[11px] tracking-wider mb-3">
              4. Address & Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="font-medium text-foreground block mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  placeholder="United States"
                  value={form.country}
                  onChange={handleChange}
                  className="w-full text-xs p-2 rounded-md border border-input bg-background"
                />
              </div>
              <div>
                <label className="font-medium text-foreground block mb-1">State / Province</label>
                <input
                  type="text"
                  name="state"
                  placeholder="California"
                  value={form.state}
                  onChange={handleChange}
                  className="w-full text-xs p-2 rounded-md border border-input bg-background"
                />
              </div>
              <div>
                <label className="font-medium text-foreground block mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="San Francisco"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full text-xs p-2 rounded-md border border-input bg-background"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Tags */}
          <div>
            <h3 className="font-semibold text-primary uppercase text-[11px] tracking-wider mb-2 flex items-center space-x-1.5">
              <Tag className="h-3.5 w-3.5" />
              <span>Tags & Labels</span>
            </h3>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {defaultTags.map((tag) => {
                const selected = form.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-full text-[11px] border font-medium flex items-center space-x-1 transition-colors ${
                      selected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/40 hover:bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {selected && <Check className="h-3 w-3" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom tag..."
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomTag();
                  }
                }}
                className="text-xs p-1.5 rounded-md border border-input bg-background w-48"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1"
                onClick={addCustomTag}
              >
                <Plus className="h-3 w-3" />
                <span>Add Tag</span>
              </Button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-3 border-t border-border bg-muted/20">
          <Button variant="outline" size="sm" disabled={isSubmitting} onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="gap-1.5"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Lead' : 'Create Lead'}
          </Button>
        </div>
      </div>
    </div>
  );
}
