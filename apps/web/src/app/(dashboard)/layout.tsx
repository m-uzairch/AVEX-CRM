'use client';

import * as React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNavbar } from '@/components/layout/top-navbar';
import { OnboardingTourModal } from '@/components/onboarding/onboarding-tour-modal';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  return (
    <div className="h-screen h-dvh bg-slate-50/70 dark:bg-background text-foreground flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Layout Container */}
      <div
        className={cn(
          'flex-1 flex flex-col h-full min-w-0 transition-all duration-200 ease-in-out overflow-hidden',
          isCollapsed ? 'lg:pl-[5.5rem]' : 'lg:pl-[16.5rem]',
        )}
      >
        <div className="pt-3 px-3 lg:pl-0 lg:pr-3 shrink-0">
          <TopNavbar onOpenMobileSidebar={() => setIsMobileOpen(true)} />
        </div>
        <main className="flex-1 overflow-y-auto min-h-0 pt-3 lg:pr-3">{children}</main>
      </div>

      {/* Step-by-Step Feature Onboarding Tour Modal */}
      <OnboardingTourModal />
    </div>
  );
}
