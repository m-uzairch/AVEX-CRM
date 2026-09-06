'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientAccount, ClientNotification } from '../types/portal-types';
import { fetchClientMe, fetchClientNotifications, clientLogout } from '../services/portal-service';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  LayoutDashboard,
  FolderKanban,
  FileCheck,
  FileText,
  FileEdit,
  Calendar,
  Folder,
  MessageSquare,
  User,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Bell,
  ChevronRight,
} from 'lucide-react';

interface PortalLayoutClientProps {
  children: React.ReactNode;
}

export function PortalLayoutClient({ children }: PortalLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/portal/login';
  const [client, setClient] = React.useState<ClientAccount | null>(null);
  const [loading, setLoading] = React.useState(!isLoginPage);
  const [isMobileNavOpen, setIsMobileNavOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<ClientNotification[]>([]);
  const [showNotifs, setShowNotifs] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;
    if (!isLoginPage) {
      fetchClientMe()
        .then((data) => {
          if (isMounted) {
            setClient(data);
            setLoading(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            // If unauthenticated, clear client_session cookie and redirect to login
            document.cookie = 'client_session=; Max-Age=0; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            router.replace('/portal/login');
          }
        });

      fetchClientNotifications()
        .then((notifs) => {
          if (isMounted) setNotifications(notifs);
        })
        .catch(() => {});
    }

    return () => {
      isMounted = false;
    };
  }, [isLoginPage, router]);

  // Close mobile nav on route change
  React.useEffect(() => {
    setIsMobileNavOpen(false);
    setShowNotifs(false);
  }, [pathname]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (loading || !client) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 space-y-4">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span>Verifying secure client session...</span>
        </div>
        <div className="flex items-center space-x-3 text-xs pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              document.cookie = 'client_session=; Max-Age=0; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
              router.replace('/portal/login');
            }}
          >
            Client Sign In
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              router.replace('/login');
            }}
          >
            Staff CRM Login
          </Button>
        </div>
      </div>
    );
  }

  const navLinks = [
    { href: '/portal', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: '/portal/projects', label: 'Projects', icon: <FolderKanban className="h-4 w-4" /> },
    { href: '/portal/quotations', label: 'Quotations', icon: <FileCheck className="h-4 w-4" /> },
    { href: '/portal/invoices', label: 'Invoices', icon: <FileText className="h-4 w-4" /> },
    { href: '/portal/requests', label: 'Requests', icon: <FileEdit className="h-4 w-4" /> },
    { href: '/portal/meetings', label: 'Meetings', icon: <Calendar className="h-4 w-4" /> },
    { href: '/portal/files', label: 'Files', icon: <Folder className="h-4 w-4" /> },
    { href: '/portal/messages', label: 'Messages', icon: <MessageSquare className="h-4 w-4" /> },
    { href: '/portal/profile', label: 'Profile', icon: <User className="h-4 w-4" /> },
  ];

  const handleLogout = async () => {
    await clientLogout();
    router.push('/portal/login');
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const initials = client?.name
    ? client.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    : 'CL';

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Client Portal Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            {/* Left: Mobile Toggle & Brand */}
            <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-9 w-9 text-muted-foreground shrink-0"
                onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                aria-label="Toggle navigation"
              >
                {isMobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              <Link href="/portal" className="flex items-center space-x-2.5 shrink-0 group">
                <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground font-extrabold flex items-center justify-center text-sm shadow-xs shrink-0">
                  AV
                </div>
                <div className="flex flex-col shrink-0">
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="font-bold text-sm tracking-tight text-foreground">AVEX</span>
                    <Badge variant="secondary" className="text-[10px] font-medium px-1.5 py-0 whitespace-nowrap">
                      Client Portal
                    </Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground hidden sm:inline max-w-[130px] md:max-w-[160px] truncate">
                    {client?.customer?.companyName || 'Enterprise Workspace'}
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1.5 overflow-x-auto no-scrollbar py-1">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== '/portal' && pathname.startsWith(link.href));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-1.5 px-2.5 xl:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  >
                    {link.icon}
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: Actions, Notifications, Profile & Logout */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
              <ThemeToggle />

              {/* Notification Popover Button */}
              <div className="relative shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground relative shrink-0"
                  onClick={() => setShowNotifs(!showNotifs)}
                  title="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
                  )}
                </Button>

                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card shadow-lg p-3 z-50 animate-in fade-in-50 zoom-in-95">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                      <span className="text-xs font-bold text-foreground">Client Updates</span>
                      <Badge variant="outline" className="text-[10px]">
                        {notifications.length} updates
                      </Badge>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">No recent updates</p>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            className="p-2 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors text-xs space-y-1"
                          >
                            <p className="font-semibold text-foreground">{notif.title}</p>
                            <p className="text-muted-foreground text-[11px]">{notif.message}</p>
                            {notif.link && (
                              <Link
                                href={notif.link}
                                className="text-[10px] text-primary font-medium hover:underline flex items-center gap-0.5 mt-1"
                              >
                                View details <ChevronRight className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Badge */}
              {client && (
                <Link
                  href="/portal/profile"
                  className="flex items-center space-x-1.5 sm:space-x-2 p-1 rounded-lg hover:bg-muted/60 transition-colors text-xs shrink-0"
                  title="Client Profile"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center border border-primary/20 text-xs shrink-0">
                    {initials}
                  </div>
                  <div className="hidden 2xl:flex flex-col text-left">
                    <span className="font-bold text-foreground truncate max-w-[110px]">{client.name}</span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[110px]">
                      {client.customer?.companyName || 'Client'}
                    </span>
                  </div>
                </Link>
              )}

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                title="Sign Out of Client Portal"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Sub-bar for medium devices */}
        <div className="lg:hidden border-t border-border/60 bg-card px-4 py-2 overflow-x-auto">
          <div className="flex items-center space-x-1 min-w-max">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== '/portal' && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary font-bold shadow-2xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu (When Toggle is Opened) */}
      {isMobileNavOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-50 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border-b border-border p-4 shadow-xl space-y-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== '/portal' && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileNavOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <div className="pt-4 border-t border-border mt-3">
              <Button
                variant="outline"
                className="w-full justify-start text-destructive gap-2 text-xs"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      </main>

      {/* Footer with Security Badge */}
      <footer className="border-t border-border bg-card py-4 text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} AVEX CRM Client Workspace. All client communications encrypted.</p>
          <span className="flex items-center gap-1.5 font-semibold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <ShieldCheck className="h-3.5 w-3.5" /> Protected Client Isolation
          </span>
        </div>
      </footer>
    </div>
  );
}
