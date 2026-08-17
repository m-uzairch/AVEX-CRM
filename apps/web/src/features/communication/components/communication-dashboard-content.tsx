'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Meeting } from '@/features/communication/types/communication-types';
import { fetchMeetings } from '@/features/communication/services/communication-service';
import {
  MessageSquare,
  Calendar,
  Megaphone,
  Video,
  ArrowRight,
  Users,
  Clock,
  Bell,
} from 'lucide-react';

const NAV_CARDS = [
  {
    title: 'Project Chats',
    description: 'Communicate with your project teams directly inside each project.',
    icon: MessageSquare,
    href: '/projects',
    color: 'text-indigo-500',
    bg: 'bg-indigo-500/10',
  },
  {
    title: 'Meetings',
    description: 'Schedule, manage, and review project meetings with your team and clients.',
    icon: Calendar,
    href: '/projects',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    title: 'Announcements',
    description: 'Post company, team, and project announcements to keep everyone in the loop.',
    icon: Megaphone,
    href: '/communication/announcements',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
];

export function CommunicationDashboardContent() {
  const [meetings, setMeetings] = React.useState<Meeting[]>([]);

  React.useEffect(() => {
    fetchMeetings().then(setMeetings).catch(console.error);
  }, []);

  const upcomingMeetings = meetings
    .filter((m) => m.status === 'SCHEDULED')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Communication Hub</h1>
          <p className="text-sm text-muted-foreground">Centralized communication, meetings & announcements</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Bell className="h-4 w-4" /> Notifications
          </Button>
          <Link href="/communication/announcements">
            <Button size="sm" className="gap-1.5 text-xs font-bold">
              <Megaphone className="h-4 w-4" /> Announcements
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {NAV_CARDS.map(({ title, description, icon: Icon, href, color, bg }) => (
          <Link key={title} href={href}>
            <Card className="shadow-xs hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full">
              <CardContent className="p-5 space-y-3">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{description}</p>
                </div>
                <div className={`flex items-center text-xs font-semibold ${color}`}>
                  Open <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Meetings */}
        <Card className="shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Upcoming Meetings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {upcomingMeetings.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No upcoming meetings scheduled.
              </div>
            ) : (
              upcomingMeetings.map((m) => {
                const start = new Date(m.startTime);
                return (
                  <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 transition-colors">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        {m.meetingType === 'ONLINE'
                          ? <Video className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                          : <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                        <span className="text-xs font-bold text-foreground">{m.title}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at{' '}
                        {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {m.meetingLink && (
                      <a href={m.meetingLink} target="_blank" rel="noopener noreferrer">
                        <Badge variant="outline" className="text-[10px] font-semibold text-primary border-primary/30 hover:bg-primary/5 cursor-pointer">
                          Join
                        </Badge>
                      </a>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Shortcuts */}
        <Card className="shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-500" />
              Quick Links
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-2">
              {[
                { label: 'View All Announcements', href: '/communication/announcements', icon: Megaphone, color: 'text-amber-500' },
                { label: 'All Projects & Chats', href: '/projects', icon: MessageSquare, color: 'text-indigo-500' },
              ].map(({ label, href, icon: Icon, color }) => (
                <Link key={label} href={href}>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${color}`} />
                      <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">{label}</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-4 p-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 text-[11px] text-center text-muted-foreground space-y-1">
              <p className="font-bold text-foreground">Real-Time Messaging</p>
              <p>WebSocket / Supabase Realtime integration is prepared and can be enabled in a future sprint.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
