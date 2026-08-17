import * as React from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { APP_NAME, APP_TAGLINE, APP_VERSION } from '@avex/constants';
import { Building2, ShieldCheck, Sparkles } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground">
      {/* Left Branding Side Banner (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-card border-r border-border p-12 flex-col justify-between relative overflow-hidden">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-md">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <span className="font-bold text-xl tracking-tight">{APP_NAME}</span>
            <span className="ml-2 text-xs font-mono text-muted-foreground">v{APP_VERSION}</span>
          </div>
        </div>

        <div className="space-y-6 max-w-md">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Powered Business Management</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight">
            {APP_TAGLINE}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Centralized multi-tenant operating system for managing customers, projects, employees, attendance, inventory, and invoices from a single unified application.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 text-xs text-muted-foreground border-t border-border">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-success" />
              <span>Multi-Tenant Data Isolation</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-success" />
              <span>Role-Based Access Control</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          © 2026 AVEX CRM. Enterprise Business Platform.
        </div>
      </div>

      {/* Right Form Area */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 px-6 flex items-center justify-between border-b border-border lg:border-none">
          <Link href="/" className="lg:hidden flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="font-bold text-base">{APP_NAME}</span>
          </Link>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
