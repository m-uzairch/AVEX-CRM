'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ClientAccount } from '../types/portal-types';
import { fetchClientMe } from '../services/portal-service';
import {
  LayoutDashboard,
  FolderKanban,
  FileEdit,
  MessageSquare,
  User,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

interface PortalLayoutClientProps {
  children: React.ReactNode;
}

export function PortalLayoutClient({ children }: PortalLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [client, setClient] = React.useState<ClientAccount | null>(null);

  const isLoginPage = pathname === '/portal/login';

  React.useEffect(() => {
    if (!isLoginPage) {
      fetchClientMe()
        .then(setClient)
        .catch(() => {
          // If login fails, redirect to portal login
        });
    }
  }, [isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  const navLinks = [
    { href: '/portal', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: '/portal/projects', label: 'My Projects', icon: <FolderKanban className="h-4 w-4" /> },
    { href: '/portal/change-requests', label: 'Change Requests', icon: <FileEdit className="h-4 w-4" /> },
    { href: '/portal/messages', label: 'Messages', icon: <MessageSquare className="h-4 w-4" /> },
    { href: '/portal/profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
  ];

  const handleLogout = () => {
    document.cookie = 'client_session=; Max-Age=0; path=/;';
    router.push('/portal/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Client Portal Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Branding */}
            <div className="flex items-center space-x-3">
              <Link href="/portal" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground font-extrabold flex items-center justify-center text-sm shadow-xs">
                  AV
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm tracking-tight text-foreground flex items-center gap-1.5">
                    AVEX <span className="text-xs font-semibold px-2 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">Client Portal</span>
                  </span>
                </div>
              </Link>
            </div>

            {/* Navigation Bar */}
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/portal' && pathname.startsWith(link.href));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Client User Menu */}
            <div className="flex items-center space-x-3">
              {client && (
                <div className="flex items-center space-x-2 text-xs">
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20">
                    {client.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .substring(0, 2)}
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="font-bold text-foreground truncate max-w-[120px]">{client.name}</span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{client.customer?.companyName}</span>
                  </div>
                </div>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-9 w-9 text-muted-foreground hover:text-destructive"
                title="Log Out Client Portal"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-4 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} AVEX CRM Client Workspace. All client communications encrypted.</p>
          <span className="flex items-center gap-1 font-semibold text-emerald-500">
            <ShieldCheck className="h-4 w-4" /> Protected Client Isolation
          </span>
        </div>
      </footer>
    </div>
  );
}
