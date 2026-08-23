'use client';

import * as React from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ClientMeeting, ClientProjectOverview } from '@/features/portal/types/portal-types';
import {
  meetingRequestFormSchema,
  MeetingRequestFormValues,
} from '@/features/portal/schemas/portal-schemas';
import {
  fetchClientMeetings,
  requestClientMeeting,
  fetchClientProjects,
} from '@/features/portal/services/portal-service';
import {
  Calendar,
  Clock,
  Video,
  Plus,
  Loader2,
  User,
  FolderKanban,
  AlertCircle,
  Search,
  ArrowRight,
  MapPin,
  Phone,
  Layers,
  Sparkles,
  CheckCircle2,
  XCircle,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';

export default function ClientMeetingsPage() {
  const [meetings, setMeetings] = React.useState<ClientMeeting[]>([]);
  const [upcoming, setUpcoming] = React.useState<ClientMeeting[]>([]);
  const [past, setPast] = React.useState<ClientMeeting[]>([]);
  const [projects, setProjects] = React.useState<ClientProjectOverview[]>([]);
  const [kpis, setKpis] = React.useState({ upcomingCount: 0, pastCount: 0, totalCount: 0 });
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const [timeTab, setTimeTab] = React.useState<'all' | 'upcoming' | 'past'>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState('ALL');
  const [statusFilter, setStatusFilter] = React.useState('ALL');

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [meetData, projData] = await Promise.all([
        fetchClientMeetings({
          status: statusFilter,
          type: typeFilter,
          timeFilter: timeTab,
          search: searchQuery,
        }),
        fetchClientProjects(),
      ]);
      setMeetings(meetData.meetings || []);
      setUpcoming(meetData.upcoming || []);
      setPast(meetData.past || []);
      if (meetData.kpis) {
        setKpis(meetData.kpis);
      }
      setProjects(projData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [timeTab, statusFilter, typeFilter, searchQuery]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MeetingRequestFormValues>({
    resolver: zodResolver(meetingRequestFormSchema),
    defaultValues: {
      projectId: '',
      title: '',
      description: '',
      meetingType: 'ONLINE',
      preferredDate: '',
      preferredTime: '10:00',
      durationMinutes: 30,
    },
  });

  const selectedType = watch('meetingType');

  const onSubmit = async (values: MeetingRequestFormValues) => {
    try {
      setSubmitting(true);
      setSubmitError(null);
      await requestClientMeeting(values);
      setIsModalOpen(false);
      reset();
      await loadData();
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to schedule meeting.');
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'IN_PERSON':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
            <MapPin className="h-3 w-3" /> In Person
          </span>
        );
      case 'PHONE_CALL':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
            <Phone className="h-3 w-3" /> Phone Call
          </span>
        );
      case 'OTHER':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-500/10 px-2.5 py-0.5 rounded-md border border-slate-500/20">
            <Layers className="h-3 w-3" /> Other
          </span>
        );
      case 'ONLINE':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-md border border-purple-500/20">
            <Video className="h-3 w-3" /> Online Video
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-semibold gap-1">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="destructive" className="text-xs font-semibold gap-1">
            <XCircle className="h-3 w-3" /> Cancelled
          </Badge>
        );
      case 'IN_PROGRESS':
        return (
          <Badge variant="default" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-xs font-semibold gap-1">
            <Clock className="h-3 w-3 animate-pulse" /> Live Now
          </Badge>
        );
      case 'SCHEDULED':
      default:
        return (
          <Badge variant="outline" className="text-primary border-primary/30 text-xs font-semibold gap-1">
            <Clock className="h-3 w-3" /> Scheduled
          </Badge>
        );
    }
  };

  const displayedMeetings = timeTab === 'upcoming' ? upcoming : timeTab === 'past' ? past : meetings;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Scheduled Meetings</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Access upcoming video syncs, review agendas, join links, or request a consultation session.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-2 text-xs font-semibold shadow-xs">
          <Plus className="h-4 w-4" /> Request Meeting
        </Button>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4 bg-card/60 backdrop-blur-xs border-border/80">
          <p className="text-[11px] font-medium text-purple-600 dark:text-purple-400">Upcoming Syncs</p>
          <p className="text-2xl font-bold text-foreground mt-1">{kpis.upcomingCount}</p>
        </Card>
        <Card className="p-4 bg-card/60 backdrop-blur-xs border-border/80">
          <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Past & Completed</p>
          <p className="text-2xl font-bold text-foreground mt-1">{kpis.pastCount}</p>
        </Card>
        <Card className="p-4 bg-card/60 backdrop-blur-xs border-border/80">
          <p className="text-[11px] font-medium text-muted-foreground">Total Sessions</p>
          <p className="text-2xl font-bold text-foreground mt-1">{kpis.totalCount}</p>
        </Card>
      </div>

      {/* UPCOMING SESSIONS SPOTLIGHT */}
      {upcoming.length > 0 && timeTab !== 'past' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" /> Upcoming Meetings & Syncs
            </h2>
            <span className="text-xs text-muted-foreground">
              {upcoming.length} scheduled session{upcoming.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcoming.map((m) => (
              <Card
                key={m.id}
                className="border-purple-500/30 bg-purple-500/5 hover:border-purple-500/50 transition-all duration-200 shadow-xs flex flex-col justify-between"
              >
                <CardHeader className="p-5 pb-3 space-y-2">
                  <div className="flex items-center justify-between">
                    {getTypeBadge(m.meetingType)}
                    {getStatusBadge(m.status)}
                  </div>
                  <CardTitle className="text-base font-bold text-foreground truncate">
                    <Link href={`/portal/meetings/${m.id}`} className="hover:text-primary transition-colors">
                      {m.title}
                    </Link>
                  </CardTitle>
                  {m.project && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 truncate font-medium">
                      <FolderKanban className="h-3.5 w-3.5 text-primary" />
                      [{m.project.projectCode}] {m.project.name}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-4">
                  <div className="p-3.5 rounded-xl bg-card border border-border/70 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-foreground font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <span>
                          {new Date(m.startTime).toLocaleString([], {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-normal">
                        ({m.durationMinutes || 30} mins)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-muted-foreground pt-1">
                      <User className="h-3.5 w-3.5" />
                      <span>Host: {m.organizer?.fullName || 'Project Lead'}</span>
                    </div>
                  </div>

                  {m.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {m.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    {m.meetingLink ? (
                      <a href={m.meetingLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button size="sm" className="w-full text-xs font-semibold gap-1.5 bg-purple-600 hover:bg-purple-700 text-white shadow-xs">
                          <Video className="h-4 w-4" /> Join Meeting
                        </Button>
                      </a>
                    ) : m.location ? (
                      <div className="flex-1 text-xs text-muted-foreground flex items-center gap-1 bg-muted p-2 rounded-md">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        <span className="truncate">{m.location}</span>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" disabled className="flex-1 text-xs">
                        Link Pending
                      </Button>
                    )}

                    <Link href={`/portal/meetings/${m.id}`}>
                      <Button size="sm" variant="outline" className="text-xs gap-1">
                        Details <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* FILTER & TABS TOOLBAR */}
      <Card className="p-3 bg-card border-border">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Time Tabs */}
          <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg self-start">
            <button
              onClick={() => setTimeTab('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                timeTab === 'all'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All ({kpis.totalCount})
            </button>
            <button
              onClick={() => setTimeTab('upcoming')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                timeTab === 'upcoming'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Upcoming ({kpis.upcomingCount})
            </button>
            <button
              onClick={() => setTimeTab('past')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                timeTab === 'past'
                  ? 'bg-background text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Past ({kpis.pastCount})
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[180px] flex-1 sm:flex-initial">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search meetings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>

            <div className="flex items-center space-x-1 bg-background border border-input rounded-md px-2 py-1 h-8">
              <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-xs text-foreground focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Types</option>
                <option value="ONLINE">Online</option>
                <option value="IN_PERSON">In Person</option>
                <option value="PHONE_CALL">Phone Call</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="flex items-center space-x-1 bg-background border border-input rounded-md px-2 py-1 h-8">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs text-foreground focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => loadData()}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
              title="Refresh"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* ALL / FILTERED MEETINGS LIST */}
      {loading ? (
        <div className="py-20 text-center text-xs text-muted-foreground flex flex-col justify-center items-center space-y-3">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <span className="font-medium">Loading scheduled meetings...</span>
        </div>
      ) : displayedMeetings.length === 0 ? (
        <Card className="p-12 text-center text-xs text-muted-foreground border-dashed">
          <Calendar className="h-10 w-10 text-muted-foreground/60 mx-auto mb-3" />
          <p className="text-base font-semibold text-foreground">No Meetings Found</p>
          <p className="mt-1 mb-5 max-w-sm mx-auto text-xs text-muted-foreground">
            {searchQuery || typeFilter !== 'ALL' || statusFilter !== 'ALL'
              ? 'No meetings match your selected filters. Try adjusting your search query.'
              : timeTab === 'upcoming'
              ? 'You have no upcoming sessions scheduled with the team.'
              : 'You have no meeting records in your portal history.'}
          </p>
          <Button size="sm" onClick={() => setIsModalOpen(true)} className="gap-2 text-xs font-semibold shadow-xs">
            <Plus className="h-4 w-4" /> Request a Sync
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedMeetings.map((m) => (
            <Card
              key={m.id}
              className="hover:border-primary/50 transition-all duration-200 shadow-2xs hover:shadow-xs flex flex-col justify-between bg-card"
            >
              <CardHeader className="p-5 pb-3 space-y-2">
                <div className="flex items-center justify-between">
                  {getTypeBadge(m.meetingType)}
                  {getStatusBadge(m.status)}
                </div>
                <CardTitle className="text-base font-bold truncate text-foreground">
                  <Link href={`/portal/meetings/${m.id}`} className="hover:text-primary transition-colors">
                    {m.title}
                  </Link>
                </CardTitle>
                {m.project && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 truncate font-medium">
                    <FolderKanban className="h-3.5 w-3.5 text-primary" />
                    [{m.project.projectCode}] {m.project.name}
                  </p>
                )}
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-4">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-foreground font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span>
                        {new Date(m.startTime).toLocaleString([], {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-normal">
                      {m.durationMinutes || 30}m
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    <span>Host: {m.organizer?.fullName || 'Project Lead'}</span>
                  </div>
                </div>

                {m.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {m.description}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                  {m.meetingLink && m.status !== 'CANCELLED' ? (
                    <a href={m.meetingLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button size="sm" className="w-full text-xs font-semibold gap-1.5 bg-purple-600 hover:bg-purple-700 text-white">
                        <Video className="h-3.5 w-3.5" /> Join Meeting
                      </Button>
                    </a>
                  ) : (
                    <Link href={`/portal/meetings/${m.id}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        View Details
                      </Button>
                    </Link>
                  )}

                  <Link href={`/portal/meetings/${m.id}`}>
                    <Button size="sm" variant="ghost" className="text-xs px-2.5">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* SCHEDULE MEETING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl max-w-lg w-full space-y-4 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Request a Meeting
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {submitError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Project Association</label>
                <select
                  {...register('projectId')}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">-- General Account Meeting --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.projectCode}] {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Meeting Topic / Title *</label>
                <Input
                  {...register('title')}
                  placeholder="e.g. Sprint Review, Scope Discussion, Milestone Sign-off..."
                  className="text-xs"
                />
                {errors.title && (
                  <p className="text-destructive text-[11px] font-medium">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Meeting Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'ONLINE', label: 'Online Video', icon: <Video className="h-3.5 w-3.5" /> },
                    { value: 'IN_PERSON', label: 'In Person', icon: <MapPin className="h-3.5 w-3.5" /> },
                    { value: 'PHONE_CALL', label: 'Phone Call', icon: <Phone className="h-3.5 w-3.5" /> },
                    { value: 'OTHER', label: 'Other', icon: <Layers className="h-3.5 w-3.5" /> },
                  ].map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setValue('meetingType', t.value as any)}
                      className={`p-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        selectedType === t.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-1 sm:col-span-1">
                  <label className="font-semibold text-foreground">Date *</label>
                  <Input type="date" {...register('preferredDate')} className="text-xs" />
                  {errors.preferredDate && (
                    <p className="text-destructive text-[11px] font-medium">{errors.preferredDate.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Time *</label>
                  <Input type="time" {...register('preferredTime')} className="text-xs" />
                  {errors.preferredTime && (
                    <p className="text-destructive text-[11px] font-medium">{errors.preferredTime.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Duration</label>
                  <select
                    {...register('durationMinutes', { valueAsNumber: true })}
                    className="w-full h-9 rounded-lg border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value={15}>15 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Agenda & Discussion Notes</label>
                <Textarea
                  {...register('description')}
                  rows={3}
                  placeholder="Key topics, questions, or goals for this session..."
                  className="text-xs resize-none"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting} className="font-semibold gap-1.5">
                  {submitting ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Scheduling...
                    </>
                  ) : (
                    'Confirm Request'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
