'use client';

import * as React from 'react';
import { useOnboardingTour, shouldAutoOpenTour } from '@/hooks/use-onboarding-tour';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Users,
  FolderKanban,
  Receipt,
  Clock,
  ShieldCheck,
  Bot,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Compass,
  FileSpreadsheet,
  Layers,
  CreditCard,
  Building2,
  MessageSquare,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface TourStep {
  id: string;
  stepNumber: number;
  badge: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconBg: string;
  highlights: {
    title: string;
    description: string;
    icon: React.ReactNode;
  }[];
  primaryActionLabel?: string;
  primaryActionRoute?: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    stepNumber: 1,
    badge: 'Welcome to AVEX CRM',
    title: 'Your All-in-One Business Operating System',
    subtitle: 'Streamline your sales pipeline, project delivery, team attendance, and client billing in one unified platform.',
    icon: <Sparkles className="h-8 w-8 text-primary" />,
    iconBg: 'bg-primary/10 border-primary/20 text-primary',
    highlights: [
      {
        title: 'Unified Workspace',
        description: 'Manage customers, active projects, team shifts, and financials without switching between multiple apps.',
        icon: <Layers className="h-4 w-4 text-primary" />,
      },
      {
        title: 'Clean Zero-State Design',
        description: 'Start with a fresh workspace tailored to your business. You control all data entered from day one.',
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      },
      {
        title: 'Enterprise Multi-Tenancy',
        description: 'Secure tenant isolation with Role-Based Access Control (Owner, Admin, Employee, and Client perspectives).',
        icon: <ShieldCheck className="h-4 w-4 text-blue-500" />,
      },
    ],
  },
  {
    id: 'crm',
    stepNumber: 2,
    badge: 'Sales & CRM',
    title: 'Capture Leads & Close High-Value Deals',
    subtitle: 'Track prospective clients through visual pipeline stages and build 360-degree customer relationship records.',
    icon: <Users className="h-8 w-8 text-blue-500" />,
    iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    primaryActionLabel: 'Explore CRM',
    primaryActionRoute: '/crm',
    highlights: [
      {
        title: 'Visual Kanban Deal Pipeline',
        description: 'Drag and drop deals from New Lead to Qualified, Proposal Sent, Negotiation, and Won.',
        icon: <Compass className="h-4 w-4 text-blue-500" />,
      },
      {
        title: '360° Customer Profiles',
        description: 'Complete relationship history including activity timeline, internal notes, quotes, invoices, and files.',
        icon: <Building2 className="h-4 w-4 text-indigo-500" />,
      },
      {
        title: 'AI-Powered Lead Import',
        description: 'Bulk upload leads from CSV, XLSX, and PDF documents with automated smart field extraction.',
        icon: <FileSpreadsheet className="h-4 w-4 text-emerald-500" />,
      },
    ],
  },
  {
    id: 'projects',
    stepNumber: 3,
    badge: 'Operations & Delivery',
    title: 'Manage Projects, Milestones & Team Tasks',
    subtitle: 'Keep client deliverables on track with customizable project milestones, budgets, and Kanban task boards.',
    icon: <FolderKanban className="h-8 w-8 text-purple-500" />,
    iconBg: 'bg-purple-500/10 border-purple-500/20 text-purple-500',
    primaryActionLabel: 'View Projects',
    primaryActionRoute: '/projects',
    highlights: [
      {
        title: 'Milestone & Budget Tracking',
        description: 'Monitor project phases, completion percentage, team members, and estimated budgets.',
        icon: <FolderKanban className="h-4 w-4 text-purple-500" />,
      },
      {
        title: 'Kanban Task Management',
        description: 'Prioritize tasks (Urgent, High, Medium, Low) and assign action items directly to team members.',
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      },
      {
        title: 'Shared Project Documents',
        description: 'Centralize briefs, contracts, and technical specifications for every active project.',
        icon: <Layers className="h-4 w-4 text-purple-500" />,
      },
    ],
  },
  {
    id: 'finance',
    stepNumber: 4,
    badge: 'Finance & Invoicing',
    title: 'Professional Invoices & Recurring Billing',
    subtitle: 'Generate branded PDF invoices, track payment status, and automate subscription billings effortlessly.',
    icon: <Receipt className="h-8 w-8 text-emerald-500" />,
    iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    primaryActionLabel: 'Explore Invoices',
    primaryActionRoute: '/invoices',
    highlights: [
      {
        title: 'Instant PDF Generation',
        description: 'Generate polished, client-ready invoices and quotations with taxes, discounts, and itemized lines.',
        icon: <Receipt className="h-4 w-4 text-emerald-500" />,
      },
      {
        title: 'Automated Recurring Billing',
        description: 'Schedule automated daily/monthly invoices for retainer contracts with built-in cron processing.',
        icon: <CreditCard className="h-4 w-4 text-teal-500" />,
      },
      {
        title: 'Expense & Tax Management',
        description: 'Record operating expenses, manage vendor directories, and configure regional tax templates.',
        icon: <Layers className="h-4 w-4 text-emerald-500" />,
      },
    ],
  },
  {
    id: 'hr',
    stepNumber: 5,
    badge: 'Human Resources',
    title: 'Team Directory, Shifts & Attendance',
    subtitle: 'Manage your workforce, track daily shift check-ins, and maintain structured employee profiles.',
    icon: <Clock className="h-8 w-8 text-amber-500" />,
    iconBg: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
    primaryActionLabel: 'View Employees',
    primaryActionRoute: '/employees',
    highlights: [
      {
        title: 'Employee Profiles & Roles',
        description: 'Maintain staff contact info, departments, designations, and granular role permissions.',
        icon: <Users className="h-4 w-4 text-amber-500" />,
      },
      {
        title: 'Daily Attendance Logging',
        description: 'Track clock-in/out timestamps, break durations, shift notes, and daily work hours.',
        icon: <Clock className="h-4 w-4 text-orange-500" />,
      },
      {
        title: 'Team Performance Metrics',
        description: 'View individual productivity stats, completed tasks, and assigned account portfolios.',
        icon: <CheckCircle2 className="h-4 w-4 text-amber-500" />,
      },
    ],
  },
  {
    id: 'portal',
    stepNumber: 6,
    badge: 'Client Experience',
    title: 'Dedicated Self-Service Client Portal',
    subtitle: 'Give your clients a branded online portal to review milestones, pay invoices, and request scope changes.',
    icon: <ShieldCheck className="h-8 w-8 text-cyan-500" />,
    iconBg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500',
    primaryActionLabel: 'Preview Portal',
    primaryActionRoute: '/portal',
    highlights: [
      {
        title: 'Client Project Visibility',
        description: 'Clients can log in to view active milestones, project deliverables, and shared files securely.',
        icon: <ShieldCheck className="h-4 w-4 text-cyan-500" />,
      },
      {
        title: 'Online Quotations & Invoices',
        description: 'Clients can review estimates, download PDFs, and verify invoice settlement status directly.',
        icon: <Receipt className="h-4 w-4 text-cyan-500" />,
      },
      {
        title: 'Change Requests & Messaging',
        description: 'Submit formal change requests, schedule meetings, and communicate directly with project leads.',
        icon: <MessageSquare className="h-4 w-4 text-cyan-500" />,
      },
    ],
  },
  {
    id: 'ai',
    stepNumber: 7,
    badge: 'AI & Automations',
    title: 'Smart AI Tools & Automated Communications',
    subtitle: 'Harness Google Gemini OCR and automated transactional emails to boost team productivity.',
    icon: <Bot className="h-8 w-8 text-pink-500" />,
    iconBg: 'bg-pink-500/10 border-pink-500/20 text-pink-500',
    highlights: [
      {
        title: 'Gemini AI Document Extraction',
        description: 'Automatically parse lead information, business cards, and unstructured invoices using AI OCR.',
        icon: <Bot className="h-4 w-4 text-pink-500" />,
      },
      {
        title: 'Resend Transactional Emails',
        description: 'Deliver quotes, invoices, and password reset notifications seamlessly via Resend.',
        icon: <MessageSquare className="h-4 w-4 text-rose-500" />,
      },
      {
        title: 'WhatsApp Business Notifications',
        description: 'Send automated invoice payment reminders and lead updates directly to customer WhatsApp.',
        icon: <Sparkles className="h-4 w-4 text-pink-500" />,
      },
    ],
  },
  {
    id: 'get_started',
    stepNumber: 8,
    badge: 'Ready to Launch!',
    title: "You're All Set! Start Building Your Workspace",
    subtitle: 'Your dashboard is clean and ready. Follow these recommended first steps to populate your workspace:',
    icon: <CheckCircle2 className="h-8 w-8 text-emerald-500" />,
    iconBg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    highlights: [
      {
        title: '1. Add your first Customer or Lead',
        description: 'Navigate to CRM to create client profiles or import leads from a spreadsheet.',
        icon: <Users className="h-4 w-4 text-blue-500" />,
      },
      {
        title: '2. Create a Project & Tasks',
        description: 'Set up an active client project and assign milestones to your team members.',
        icon: <FolderKanban className="h-4 w-4 text-purple-500" />,
      },
      {
        title: '3. Customize Company Settings',
        description: 'Set your company name, logo, tax templates, and invite teammates under Settings.',
        icon: <Building2 className="h-4 w-4 text-amber-500" />,
      },
    ],
  },
];

export function OnboardingTourModal() {
  const { isOpen, currentStep, nextStep, prevStep, goToStep, completeTour } =
    useOnboardingTour();
  const router = useRouter();

  React.useEffect(() => {
    // Auto-open on mount if user has not completed tour
    if (shouldAutoOpenTour()) {
      const timer = setTimeout(() => {
        useOnboardingTour.getState().openTour();
      }, 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, []);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep] || TOUR_STEPS[0];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  const handleActionClick = (route?: string) => {
    completeTour();
    if (route) {
      router.push(route);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={completeTour} className="max-w-2xl p-6 sm:p-8">
      <div className="space-y-6">
        {/* Step Header */}
        <div className="flex items-start space-x-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-sm ${step.iconBg}`}
          >
            {step.icon}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 border-primary/30 text-primary">
                {step.badge}
              </Badge>
              <span className="text-xs text-muted-foreground font-medium">
                Step {step.stepNumber} of {TOUR_STEPS.length}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {step.title}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {step.subtitle}
            </p>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 gap-3 pt-1">
          {step.highlights.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start space-x-3 p-3.5 rounded-xl border border-border/80 bg-accent/20 hover:bg-accent/40 transition-colors"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background border border-border text-foreground shadow-xs">
                {item.icon}
              </div>
              <div className="flex-1 space-y-0.5">
                <h4 className="text-xs font-semibold text-foreground">{item.title}</h4>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick jump action if on last step or module step */}
        {isLastStep && (
          <div className="flex flex-wrap gap-2 pt-2">
            <Button
              size="sm"
              variant="default"
              onClick={() => handleActionClick('/crm/customers')}
              className="text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add First Customer
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleActionClick('/projects')}
              className="text-xs"
            >
              <FolderKanban className="h-3.5 w-3.5 mr-1" /> Create Project
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleActionClick('/settings')}
              className="text-xs"
            >
              <Building2 className="h-3.5 w-3.5 mr-1" /> Company Profile
            </Button>
          </div>
        )}

        {/* Step Navigation Dots & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
          {/* Progress Dots */}
          <div className="flex items-center space-x-1.5">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goToStep(idx)}
                className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                  idx === currentStep
                    ? 'w-6 bg-primary'
                    : idx < currentStep
                    ? 'w-2 bg-primary/40 hover:bg-primary/60'
                    : 'w-2 bg-muted hover:bg-muted-foreground/40'
                }`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-between sm:justify-end">
            {!isFirstStep ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={prevStep}
                className="text-xs text-muted-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={completeTour}
                className="text-xs text-muted-foreground"
              >
                Skip Tour
              </Button>
            )}

            {isLastStep ? (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={completeTour}
                className="text-xs font-semibold px-4 shadow-sm"
              >
                Get Started <Sparkles className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={nextStep}
                className="text-xs font-semibold px-4 shadow-sm"
              >
                Next <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
