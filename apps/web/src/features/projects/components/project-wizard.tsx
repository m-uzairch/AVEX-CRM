'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BusinessTypeSelector } from './business-type-selector';
import { TemplateSelector } from './template-selector';
import { ProjectPriorityBadge } from './project-badges';
import {
  BusinessTypeOption,
  ProjectCategory,
  ProjectTemplate,
  ProjectStatus,
  ProjectPriority,
} from '../types/project-types';
import { DEFAULT_MILESTONES } from '../services/project-automation-service';
import { createProject } from '../services/project-service';
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  ListOrdered,
  Plus,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

interface ProjectWizardProps {
  categories?: ProjectCategory[];
}

export function ProjectWizard({ categories = [] }: ProjectWizardProps) {
  const router = useRouter();

  const [step, setStep] = React.useState<number>(1);
  const [submitting, setSubmitting] = React.useState(false);
  const [createdProjectId, setCreatedProjectId] = React.useState<string | null>(null);

  // Form State
  const [businessType, setBusinessType] = React.useState<BusinessTypeOption>('DIGITAL');
  const [selectedTemplate, setSelectedTemplate] = React.useState<ProjectTemplate | null>(null);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [customerId, setCustomerId] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [status, setStatus] = React.useState<ProjectStatus>('PLANNING');
  const [priority, setPriority] = React.useState<ProjectPriority>('MEDIUM');
  const [projectManagerId, setProjectManagerId] = React.useState('');
  const [selectedMemberIds, setSelectedMemberIds] = React.useState<string[]>([]);
  const [budget, setBudget] = React.useState<number | undefined>(undefined);
  const [currency] = React.useState('USD');
  const [startDate, setStartDate] = React.useState('');
  const [expectedCompletionDate, setExpectedCompletionDate] = React.useState('');
  const [milestones, setMilestones] = React.useState<
    { title: string; description: string; order: number }[]
  >(DEFAULT_MILESTONES);

  // External data options
  const [customers, setCustomers] = React.useState<{ id: string; companyName: string; name: string }[]>([]);
  const [users, setUsers] = React.useState<{ id: string; fullName: string; email: string }[]>([]);

  React.useEffect(() => {
    fetch('/api/crm/customers?pageSize=100')
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setCustomers(data.data);
      })
      .catch(() => {});

    fetch('/api/crm/users?pageSize=100')
      .then((res) => res.json())
      .then((data) => {
        if (data.users) setUsers(data.users);
      })
      .catch(() => {});
  }, []);

  // When a template is selected, pre-fill category, status, priority, and milestones
  const handleSelectTemplate = (tmpl: ProjectTemplate | null) => {
    setSelectedTemplate(tmpl);
    if (tmpl) {
      if (tmpl.businessType) setBusinessType(tmpl.businessType);
      if (tmpl.defaultStatus) setStatus(tmpl.defaultStatus);
      if (tmpl.defaultPriority) setPriority(tmpl.defaultPriority);
      if (tmpl.defaultMilestones) setMilestones(tmpl.defaultMilestones);

      // Auto-match category by name if available
      const matchedCat = categories.find(
        (c) => c.name.toLowerCase() === tmpl.categoryName.toLowerCase()
      );
      if (matchedCat) {
        setCategoryId(matchedCat.id);
      }
    } else {
      setMilestones(DEFAULT_MILESTONES);
    }
  };

  const handleMemberToggle = (userId: string) => {
    if (selectedMemberIds.includes(userId)) {
      setSelectedMemberIds(selectedMemberIds.filter((id) => id !== userId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, userId]);
    }
  };

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: `Milestone 0${milestones.length + 1}`,
        description: 'Milestone description...',
        order: milestones.length + 1,
      },
    ]);
  };

  const handleRemoveMilestone = (idx: number) => {
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const handleUpdateMilestone = (idx: number, field: 'title' | 'description', value: string) => {
    const updated = [...milestones];
    updated[idx][field] = value;
    setMilestones(updated);
  };

  const handleSubmitWizard = async () => {
    try {
      setSubmitting(true);
      const project = await createProject({
        name: name || (selectedTemplate ? `${selectedTemplate.name} Implementation` : 'New Project'),
        description,
        customerId: customerId || null,
        projectManagerId: projectManagerId || null,
        categoryId: categoryId || null,
        status,
        priority,
        businessType,
        currency,
        templateId: selectedTemplate?.id || null,
        startDate: startDate || null,
        expectedCompletionDate: expectedCompletionDate || null,
        budget: budget || undefined,
        memberIds: selectedMemberIds,
        milestones,
      });

      setCreatedProjectId(project.id);
    } catch (err) {
      console.error('Failed to create project via wizard:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const stepsList = [
    'Business Type & Template',
    'Project Info',
    'Team & Manager',
    'Timeline & Milestones',
    'Review & Confirm',
  ];

  if (createdProjectId) {
    return (
      <Card className="max-w-xl mx-auto border-emerald-500/30 bg-card shadow-lg animate-in zoom-in-95">
        <CardContent className="p-8 text-center space-y-4">
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Project Created Successfully!</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your new project workspace has been established with assigned team members, automated code generation, and initial milestone structure.
          </p>
          <div className="flex justify-center space-x-3 pt-4">
            <Button variant="outline" onClick={() => router.push('/projects')}>
              Go to Projects List
            </Button>
            <Button onClick={() => router.push(`/projects/${createdProjectId}`)}>
              View Project Workspace &rarr;
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Wizard Progress Header */}
      <div className="flex items-center justify-between border-b border-border pb-4 overflow-x-auto scrollbar-none">
        {stepsList.map((stName, idx) => {
          const stepNum = idx + 1;
          const isCompleted = step > stepNum;
          const isCurrent = step === stepNum;

          return (
            <div key={stName} className="flex items-center space-x-2 shrink-0 pr-4">
              <div
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : isCurrent
                    ? 'bg-primary/20 text-primary border-2 border-primary'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
              </div>
              <span
                className={`text-xs font-semibold whitespace-nowrap ${
                  isCurrent ? 'text-foreground font-bold' : 'text-muted-foreground'
                }`}
              >
                {stName}
              </span>
              {stepNum < stepsList.length && (
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 ml-2" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Contents */}
      <Card className="shadow-xs">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="text-lg font-bold">
            Step {step}: {stepsList[step - 1]}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Select the business model and optional predefined template for initial pre-fill.'}
            {step === 2 && 'Enter project name, description, category, priority, and link to a customer account.'}
            {step === 3 && 'Assign a Project Lead and select team members for workspace access.'}
            {step === 4 && 'Define target timeline dates and preview default project milestones.'}
            {step === 5 && 'Review all project parameters before final creation.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 pt-0 space-y-6">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <BusinessTypeSelector value={businessType} onChange={setBusinessType} />
              <TemplateSelector
                selectedTemplateId={selectedTemplate?.id}
                onSelectTemplate={handleSelectTemplate}
              />
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Project Name <span className="text-destructive">*</span>
                </label>
                <Input
                  placeholder="e.g. Website Redesign & E-Commerce Integration"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Description</label>
                <Textarea
                  placeholder="Outline project objectives, key scope, and deliverables..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Customer Account</label>
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="w-full text-xs rounded-md border border-input bg-background p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select Customer (Optional)</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full text-xs rounded-md border border-input bg-background p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as ProjectPriority)}
                    className="w-full text-xs rounded-md border border-input bg-background p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Estimated Budget ($)</label>
                  <Input
                    type="number"
                    placeholder="e.g. 25000"
                    value={budget || ''}
                    onChange={(e) => setBudget(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Project Lead / Manager</label>
                <select
                  value={projectManagerId}
                  onChange={(e) => setProjectManagerId(e.target.value)}
                  className="w-full text-xs rounded-md border border-input bg-background p-2.5 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select Project Manager</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground block">
                  Assign Team Members ({selectedMemberIds.length} selected)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                  {users.map((u) => {
                    const isSelected = selectedMemberIds.includes(u.id);
                    return (
                      <div
                        key={u.id}
                        onClick={() => handleMemberToggle(u.id)}
                        className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/5 font-semibold'
                            : 'border-border hover:bg-accent/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                            {u.fullName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .substring(0, 2)}
                          </div>
                          <div>
                            <p className="text-xs text-foreground">{u.fullName}</p>
                            <p className="text-[10px] text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Start Date</label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Target Due Date</label>
                  <Input
                    type="date"
                    value={expectedCompletionDate}
                    onChange={(e) => setExpectedCompletionDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Milestones Preview */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <ListOrdered className="h-4 w-4 text-primary" />
                    Default Milestones Structure ({milestones.length})
                  </h4>
                  <Button variant="outline" size="sm" onClick={handleAddMilestone} className="gap-1 text-xs">
                    <Plus className="h-3.5 w-3.5" /> Add Milestone
                  </Button>
                </div>

                <div className="space-y-2">
                  {milestones.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-border bg-muted/30 flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-2 shrink-0 font-bold text-xs text-primary pt-1">
                        <span>{idx + 1}.</span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <Input
                          value={m.title}
                          onChange={(e) => handleUpdateMilestone(idx, 'title', e.target.value)}
                          className="h-8 text-xs font-semibold bg-background"
                        />
                        <Input
                          value={m.description}
                          onChange={(e) => handleUpdateMilestone(idx, 'description', e.target.value)}
                          className="h-7 text-[11px] text-muted-foreground bg-background"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveMilestone(idx)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <span className="text-[11px] text-muted-foreground font-mono font-bold">NEW PROJECT SUMMARY</span>
                    <h3 className="text-lg font-bold text-foreground">
                      {name || (selectedTemplate ? `${selectedTemplate.name} Project` : 'Untitled Project')}
                    </h3>
                  </div>
                  <ProjectPriorityBadge priority={priority} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Business Type</span>
                    <span className="font-semibold">{businessType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Customer</span>
                    <span className="font-semibold">
                      {customers.find((c) => c.id === customerId)?.companyName || 'Not linked'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Project Lead</span>
                    <span className="font-semibold">
                      {users.find((u) => u.id === projectManagerId)?.fullName || 'Unassigned'}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Team Members</span>
                    <span className="font-semibold">{selectedMemberIds.length} Assigned</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Budget</span>
                    <span className="font-semibold">{budget ? `$${budget.toLocaleString()}` : 'Unspecified'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Milestones</span>
                    <span className="font-semibold">{milestones.length} Configured</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Target Due Date</span>
                    <span className="font-semibold">{expectedCompletionDate || 'Unscheduled'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-6 pt-4 border-t border-border flex justify-between">
          <Button
            variant="outline"
            onClick={() => (step === 1 ? router.push('/projects') : setStep(step - 1))}
            disabled={submitting}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          {step < 5 ? (
            <Button onClick={() => setStep(step + 1)} className="gap-1">
              Next Step <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmitWizard} disabled={submitting} className="gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm & Create Project
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
