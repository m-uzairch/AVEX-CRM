'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientMeeting } from '@/features/portal/types/portal-types';
import {
  fetchClientMeetingById,
  cancelClientMeeting,
} from '@/features/portal/services/portal-service';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  User,
  FolderKanban,
  ExternalLink,
  MapPin,
  Phone,
  Layers,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  Copy,
  Check,
  Ban,
  CalendarPlus,
  ShieldCheck,
} from 'lucide-react';

export default function ClientMeetingDetailPage() {
  const params = useParams();
  const meetingId = params.id as string;

  const [meeting, setMeeting] = React.useState<ClientMeeting | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [cancelling, setCancelling] = React.useState(false);
  const [showCancelModal, setShowCancelModal] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);

  const loadMeeting = React.useCallback(async () => {
    if (!meetingId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchClientMeetingById(meetingId);
      setMeeting(data);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to load meeting details.');
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  React.useEffect(() => {
    loadMeeting();
  }, [loadMeeting]);

  const handleCopyLink = () => {
    if (meeting?.meetingLink) {
      navigator.clipboard.writeText(meeting.meetingLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCancelMeeting = async () => {
    try {
      setCancelling(true);
      await cancelClientMeeting(meetingId);
      setShowCancelModal(false);
      await loadMeeting();
    } catch (err: any) {
      alert(err?.message || 'Failed to cancel meeting.');
    } finally {
      setCancelling(false);
    }
  };

  const getGoogleCalendarUrl = (m: ClientMeeting) => {
    const start = new Date(m.startTime).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = new Date(m.endTime).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const title = encodeURIComponent(m.title);
    const details = encodeURIComponent(m.description || 'AVEX CRM Project Consultation');
    const location = encodeURIComponent(m.meetingLink || m.location || 'Online Video');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'IN_PERSON':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
            <MapPin className="h-3.5 w-3.5" /> In Person
          </span>
        );
      case 'PHONE_CALL':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
            <Phone className="h-3.5 w-3.5" /> Phone Call
          </span>
        );
      case 'OTHER':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-500/10 px-2.5 py-0.5 rounded-md border border-slate-500/20">
            <Layers className="h-3.5 w-3.5" /> Other
          </span>
        );
      case 'ONLINE':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-md border border-purple-500/20">
            <Video className="h-3.5 w-3.5" /> Online Video
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Completed
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="destructive" className="text-xs font-semibold gap-1">
            <XCircle className="h-3.5 w-3.5" /> Cancelled
          </Badge>
        );
      case 'IN_PROGRESS':
        return (
          <Badge variant="default" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-xs font-semibold gap-1">
            <Clock className="h-3.5 w-3.5 animate-pulse" /> Live Now
          </Badge>
        );
      case 'SCHEDULED':
      default:
        return (
          <Badge variant="outline" className="text-primary border-primary/30 text-xs font-semibold gap-1">
            <Clock className="h-3.5 w-3.5" /> Scheduled
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-xs text-muted-foreground flex flex-col justify-center items-center space-y-3">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <span className="font-medium">Loading session details...</span>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4">
        <div className="p-3 rounded-full bg-destructive/10 text-destructive w-fit mx-auto">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Meeting Not Found</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {error || 'The requested meeting session could not be found or you do not have permission to view it.'}
        </p>
        <div className="pt-2">
          <Link href="/portal/meetings">
            <Button size="sm" variant="outline" className="gap-2 text-xs">
              <ArrowLeft className="h-4 w-4" /> Back to Meetings
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isUpcoming = new Date(meeting.startTime) >= new Date() && meeting.status !== 'CANCELLED';
  const isCancelled = meeting.status === 'CANCELLED';

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* Breadcrumb Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Link href="/portal" className="hover:text-foreground transition-colors">
            Portal
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/portal/meetings" className="hover:text-foreground transition-colors">
            Meetings
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground font-semibold truncate max-w-[200px] sm:max-w-md">
            {meeting.title}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Link href="/portal/meetings">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <ArrowLeft className="h-4 w-4" /> Back to Meetings
            </Button>
          </Link>

          {isUpcoming && !isCancelled && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowCancelModal(true)}
              className="gap-1.5 text-xs"
            >
              <Ban className="h-4 w-4" /> Cancel Meeting
            </Button>
          )}
        </div>
      </div>

      {/* Header Banner */}
      <Card className="border-border shadow-xs bg-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {getTypeBadge(meeting.meetingType)}
                {getStatusBadge(meeting.status)}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {meeting.title}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {meeting.meetingLink && !isCancelled && (
                <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">
                  <Button className="gap-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-xs">
                    <Video className="h-4 w-4" /> Join Meeting
                  </Button>
                </a>
              )}

              {isUpcoming && (
                <a href={getGoogleCalendarUrl(meeting)} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <CalendarPlus className="h-4 w-4 text-primary" /> Add to Google Calendar
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Quick Schedule Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-primary" /> Session Date
              </span>
              <p className="font-bold text-foreground">
                {new Date(meeting.startTime).toLocaleDateString([], {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" /> Time & Duration
              </span>
              <p className="font-bold text-foreground">
                {new Date(meeting.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                {new Date(meeting.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                <span className="text-xs font-normal text-muted-foreground">({meeting.durationMinutes || 30} mins)</span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-primary" /> Meeting Lead / Host
              </span>
              <p className="font-bold text-foreground truncate">
                {meeting.organizer?.fullName || 'Senior Project Manager'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Agenda, Meeting Access & Attendees */}
        <div className="lg:col-span-2 space-y-6">
          {/* Join Link / Meeting Location Section */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border/70">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Video className="h-4 w-4 text-primary" /> Connection & Access Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-xs">
              {meeting.meetingType === 'ONLINE' ? (
                meeting.meetingLink ? (
                  <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-sm text-foreground">
                          {meeting.linkPlatform || 'Online Video Conference'}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          High-definition encrypted video consultation room.
                        </p>
                      </div>

                      <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">
                        <Button className="gap-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs">
                          <Video className="h-4 w-4" /> Join Meeting Now
                        </Button>
                      </a>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg bg-background border border-border">
                      <span className="font-mono text-[11px] text-muted-foreground truncate max-w-sm">
                        {meeting.meetingLink}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCopyLink}
                        className="h-7 text-xs gap-1 shrink-0"
                      >
                        {copiedLink ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-500" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" /> Copy Link
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-muted/40 border border-border text-center text-muted-foreground">
                    <Clock className="h-6 w-6 mx-auto mb-1 text-muted-foreground/60" />
                    <p className="font-semibold text-foreground">Meeting Link Pending</p>
                    <p className="text-[11px] mt-0.5">
                      Your host will assign the video conference link prior to the start time.
                    </p>
                  </div>
                )
              ) : meeting.meetingType === 'IN_PERSON' ? (
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-foreground">In-Person Meeting Location</p>
                    <p className="text-muted-foreground">{meeting.location || 'On-site Office / Client HQ'}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
                  <Phone className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-foreground">Phone Consultation</p>
                    <p className="text-muted-foreground">The project manager will call you directly at your registered contact number.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Agenda & Notes */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border/70">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> Session Agenda & Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 text-xs">
              <div className="whitespace-pre-wrap leading-relaxed text-foreground bg-muted/30 p-4 rounded-xl border border-border/50">
                {meeting.description || 'General progress review, deliverables sign-off, and upcoming sprint roadmap alignment.'}
              </div>
            </CardContent>
          </Card>

          {/* Attendees List */}
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-3 border-b border-border/70">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> Expected Attendees & Team
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3 text-xs">
              <div className="divide-y divide-border/60">
                {/* Host */}
                <div className="py-2.5 flex items-center justify-between first:pt-0">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      {meeting.organizer?.fullName?.charAt(0) || 'H'}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{meeting.organizer?.fullName || 'Project Lead'}</p>
                      <p className="text-[11px] text-muted-foreground">{meeting.organizer?.email || 'lead@company.com'}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    Host & Lead
                  </Badge>
                </div>

                {/* Participants */}
                {(meeting.participants || []).map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-muted text-foreground flex items-center justify-center font-bold text-xs">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-foreground">{p.name}</p>
                        {p.email && <p className="text-[11px] text-muted-foreground">{p.email}</p>}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      Participant
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Project Context & Advisory */}
        <div className="space-y-6">
          {/* Related Project */}
          {meeting.project && (
            <Card className="border-border shadow-xs">
              <CardHeader className="pb-3 border-b border-border/70">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FolderKanban className="h-4 w-4 text-primary" /> Associated Project
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-muted text-foreground">
                    {meeting.project.projectCode}
                  </span>
                  <h3 className="font-bold text-sm text-foreground mt-1.5">
                    {meeting.project.name}
                  </h3>
                </div>

                <div className="pt-2 border-t border-border/60">
                  <Link href={`/portal/projects/${meeting.project.id}`}>
                    <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                      View Project Workspace <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy & Safety Guarantee */}
          <div className="p-4 rounded-xl bg-card border border-border text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Direct Client Security</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              All meeting access links are encrypted and dedicated exclusively to authenticated team members and account stakeholders.
            </p>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl max-w-md w-full space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center space-x-3 text-destructive">
              <AlertCircle className="h-6 w-6 shrink-0" />
              <h3 className="text-base font-bold text-foreground">Cancel This Meeting?</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to cancel this session? The organizer and participants will be notified of the cancellation.
            </p>
            <div className="pt-3 border-t border-border flex items-center justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelModal(false)}
                className="text-xs"
              >
                Keep Scheduled
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={cancelling}
                onClick={handleCancelMeeting}
                className="text-xs font-semibold"
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Meeting'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
