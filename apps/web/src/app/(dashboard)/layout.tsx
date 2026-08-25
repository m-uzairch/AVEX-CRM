'use client';

import * as React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { TopNavbar } from '@/components/layout/top-navbar';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  return (
    <div className="h-screen h-dvh bg-background text-foreground flex overflow-hidden">
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
          isCollapsed ? 'lg:pl-16' : 'lg:pl-60',
        )}
      >
        <TopNavbar onOpenMobileSidebar={() => setIsMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto min-h-0">{children}</main>
      </div>
    </div>
  );
}
