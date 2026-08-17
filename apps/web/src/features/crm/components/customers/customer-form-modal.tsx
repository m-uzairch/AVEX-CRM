'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  customerFormSchema,
  CustomerFormSchemaValues,
  DEFAULT_CUSTOMER_FORM_VALUES,
} from '../../schemas/customer-schemas';
import { Customer } from '../../types/customer-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import {
  X,
  User,
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Tag as TagIcon,
  Briefcase,
  Layers,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CustomerFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  initialData?: Customer | null;
  onClose: () => void;
  onSubmit: (values: CustomerFormSchemaValues) => Promise<void>;
  isLoading?: boolean;
}

const defaultTagsList = [
  'VIP',
  'High Paying',
  'Returning Customer',
  'Enterprise',
  'Startup',
  'Follow Up',
  'Hot Lead',
];

export function CustomerFormModal({
  isOpen,
  mode,
  initialData,
  onClose,
  onSubmit,
  isLoading = false,
}: CustomerFormModalProps) {
  const [activeTab, setActiveTab] = React.useState<'basic' | 'address' | 'business' | 'crm' | 'tags'>('basic');
  const [customTagInput, setCustomTagInput] = React.useState('');
  const [availableTags, setAvailableTags] = React.useState<string[]>(defaultTagsList);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CustomerFormSchemaValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: DEFAULT_CUSTOMER_FORM_VALUES,
  });

  const selectedTags = watch('tags') || [];

  React.useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        reset({
          name: initialData.name || '',
          companyName: initialData.companyName || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
          alternatePhone: initialData.alternatePhone || '',
          country: initialData.country || '',
          state: initialData.state || '',
          city: initialData.city || '',
          address: initialData.address || '',
          postalCode: initialData.postalCode || '',
          industry: initialData.industry || 'Software & Technology',
          businessType: initialData.businessType || 'DIGITAL',
          website: initialData.website || '',
          companySize: initialData.companySize || '10-50',
          status: initialData.status || 'ACTIVE',
          source: initialData.source || 'Direct',
          priority: initialData.priority || 'MEDIUM',
          assignedEmployeeId: initialData.assignedEmployeeId || '',
          tags: initialData.tags || [],
        });
      } else {
        reset(DEFAULT_CUSTOMER_FORM_VALUES);
      }
      setActiveTab('basic');
    }
  }, [isOpen, mode, initialData, reset]);

  if (!isOpen) return null;

  const handleAddTag = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;
    if (!selectedTags.includes(trimmed)) {
      setValue('tags', [...selectedTags, trimmed]);
    }
    if (!availableTags.includes(trimmed)) {
      setAvailableTags((prev) => [...prev, trimmed]);
    }
    setCustomTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setValue(
      'tags',
      selectedTags.filter((t) => t !== tagToRemove)
    );
  };

  const handleFormSubmit = async (values: CustomerFormSchemaValues) => {
    await onSubmit(values);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-card border border-border rounded-xl shadow-xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/80">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {mode === 'create' ? 'Add New Customer' : 'Edit Customer Profile'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {mode === 'create'
                ? 'Fill out customer profile information and assign tags.'
                : `Editing details for ${initialData?.name || 'Customer'}`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border bg-muted/40 px-6 space-x-4 overflow-x-auto text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={cn(
              'py-2.5 border-b-2 transition-colors flex items-center space-x-1.5 shrink-0',
              activeTab === 'basic'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <User className="h-3.5 w-3.5" />
            <span>Basic Info</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('address')}
            className={cn(
              'py-2.5 border-b-2 transition-colors flex items-center space-x-1.5 shrink-0',
              activeTab === 'address'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Address</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('business')}
            className={cn(
              'py-2.5 border-b-2 transition-colors flex items-center space-x-1.5 shrink-0',
              activeTab === 'business'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>Business</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('crm')}
            className={cn(
              'py-2.5 border-b-2 transition-colors flex items-center space-x-1.5 shrink-0',
              activeTab === 'crm'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>CRM Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tags')}
            className={cn(
              'py-2.5 border-b-2 transition-colors flex items-center space-x-1.5 shrink-0',
              activeTab === 'tags'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <TagIcon className="h-3.5 w-3.5" />
            <span>Tags ({selectedTags.length})</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center space-x-1">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Customer Name *</span>
                  </label>
                  <Input placeholder="Sarah Jenkins" {...register('name')} className="h-9 text-xs" />
                  {errors.name && <p className="text-[11px] text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center space-x-1">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Company Name *</span>
                  </label>
                  <Input placeholder="Acuity Solutions Inc." {...register('companyName')} className="h-9 text-xs" />
                  {errors.companyName && (
                    <p className="text-[11px] text-destructive">{errors.companyName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center space-x-1">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Email Address *</span>
                  </label>
                  <Input type="email" placeholder="sarah@acuity.com" {...register('email')} className="h-9 text-xs" />
                  {errors.email && <p className="text-[11px] text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center space-x-1">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Phone Number *</span>
                  </label>
                  <Input placeholder="+1 (555) 234-5678" {...register('phone')} className="h-9 text-xs" />
                  {errors.phone && <p className="text-[11px] text-destructive">{errors.phone.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center space-x-1">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Alternate Phone (Optional)</span>
                </label>
                <Input placeholder="+1 (555) 987-6543" {...register('alternatePhone')} className="h-9 text-xs" />
              </div>
            </div>
          )}

          {/* TAB 2: ADDRESS */}
          {activeTab === 'address' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Country</label>
                  <Input placeholder="United States" {...register('country')} className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">State / Province</label>
                  <Input placeholder="California" {...register('state')} className="h-9 text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">City</label>
                  <Input placeholder="San Francisco" {...register('city')} className="h-9 text-xs" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Postal Code</label>
                  <Input placeholder="94105" {...register('postalCode')} className="h-9 text-xs" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Street Address</label>
                <Input placeholder="450 Mission St, Suite 1200" {...register('address')} className="h-9 text-xs" />
              </div>
            </div>
          )}

          {/* TAB 3: BUSINESS INFO */}
          {activeTab === 'business' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Industry</label>
                  <select
                    {...register('industry')}
                    className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs focus:outline-hidden"
                  >
                    <option value="Software & Technology">Software & Technology</option>
                    <option value="Financial Technology">Financial Technology</option>
                    <option value="Logistics & Supply Chain">Logistics & Supply Chain</option>
                    <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                    <option value="Retail & E-commerce">Retail & E-commerce</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Professional Services">Professional Services</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Business Type</label>
                  <select
                    {...register('businessType')}
                    className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs focus:outline-hidden"
                  >
                    <option value="DIGITAL">Digital</option>
                    <option value="PHYSICAL">Physical</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center space-x-1">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Website</span>
                  </label>
                  <Input placeholder="https://acuitysolutions.com" {...register('website')} className="h-9 text-xs" />
                  {errors.website && <p className="text-[11px] text-destructive">{errors.website.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Company Size</label>
                  <select
                    {...register('companySize')}
                    className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs focus:outline-hidden"
                  >
                    <option value="1-10">1 - 10 Employees</option>
                    <option value="10-50">10 - 50 Employees</option>
                    <option value="50-200">50 - 200 Employees</option>
                    <option value="200-500">200 - 500 Employees</option>
                    <option value="500+">500+ Enterprise</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CRM DETAILS */}
          {activeTab === 'crm' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Customer Status</label>
                  <select
                    {...register('status')}
                    className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs focus:outline-hidden"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="PROSPECT">Prospect</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="LOST">Lost</option>
                    <option value="BLACKLISTED">Blacklisted</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Priority</label>
                  <select
                    {...register('priority')}
                    className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs focus:outline-hidden"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Customer Source</label>
                  <select
                    {...register('source')}
                    className="w-full h-9 rounded-md border border-border bg-background px-3 text-xs focus:outline-hidden"
                  >
                    <option value="Website Lead">Website Lead</option>
                    <option value="LinkedIn Outreach">LinkedIn Outreach</option>
                    <option value="Referral">Referral</option>
                    <option value="Inbound Email">Inbound Email</option>
                    <option value="Cold Outreach">Cold Outreach</option>
                    <option value="Event / Conference">Event / Conference</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Assigned Employee</label>
                  <Input
                    placeholder="Alex Carter (Owner)"
                    {...register('assignedEmployeeId')}
                    className="h-9 text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TAGS */}
          {activeTab === 'tags' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Selected Customer Tags</label>
                <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border border-border bg-muted/20 min-h-[48px]">
                  {selectedTags.length > 0 ? (
                    selectedTags.map((tag, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs px-2.5 py-1 flex items-center space-x-1 bg-primary/10 text-primary border border-primary/20"
                      >
                        <span>{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-destructive ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No tags selected</span>
                  )}
                </div>
              </div>

              {/* Tag Picker */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Available Tags</label>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((tag, idx) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => (isSelected ? handleRemoveTag(tag) : handleAddTag(tag))}
                        className={cn(
                          'text-xs px-2.5 py-1 rounded-md border transition-colors',
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary font-semibold'
                            : 'bg-card border-border text-muted-foreground hover:bg-accent hover:text-foreground'
                        )}
                      >
                        {tag} {isSelected ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Add Custom Tag */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-foreground">Create Custom Tag</label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Enter custom tag name..."
                    value={customTagInput}
                    onChange={(e) => setCustomTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag(customTagInput);
                      }
                    }}
                    className="h-9 text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddTag(customTagInput)}
                    className="h-9 px-3 text-xs"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Add Tag
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border mt-6">
            <div className="flex space-x-2">
              {activeTab !== 'basic' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const tabs: ('basic' | 'address' | 'business' | 'crm' | 'tags')[] = [
                      'basic',
                      'address',
                      'business',
                      'crm',
                      'tags',
                    ];
                    const idx = tabs.indexOf(activeTab);
                    if (idx > 0) setActiveTab(tabs[idx - 1]);
                  }}
                  className="h-9 text-xs"
                >
                  Previous
                </Button>
              )}
              {activeTab !== 'tags' && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const tabs: ('basic' | 'address' | 'business' | 'crm' | 'tags')[] = [
                      'basic',
                      'address',
                      'business',
                      'crm',
                      'tags',
                    ];
                    const idx = tabs.indexOf(activeTab);
                    if (idx < tabs.length - 1) setActiveTab(tabs[idx + 1]);
                  }}
                  className="h-9 text-xs"
                >
                  Next Step
                </Button>
              )}
            </div>

            <div className="flex space-x-2">
              <Button type="button" variant="outline" size="sm" onClick={onClose} className="h-9 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isLoading} className="h-9 text-xs shadow-xs">
                {isLoading ? (
                  <span className="flex items-center space-x-1.5">
                    <Spinner size="sm" />
                    <span>Saving...</span>
                  </span>
                ) : (
                  <span>{mode === 'create' ? 'Create Customer' : 'Save Changes'}</span>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
