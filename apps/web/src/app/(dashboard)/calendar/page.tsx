'use client';

import * as React from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { ContentContainer } from '@/components/layout/content-container';
import { Card } from '@/components/ui/card';
import { CalendarViewHeader } from '@/features/calendar/components/calendar-view-header';
import { CalendarFilterBar } from '@/features/calendar/components/calendar-filter-bar';
import { MonthView } from '@/features/calendar/components/month-view';
import { WeekView } from '@/features/calendar/components/week-view';
import { DayView } from '@/features/calendar/components/day-view';
import { EventDialog } from '@/features/calendar/components/event-dialog';
import { EventDetailDialog } from '@/features/calendar/components/event-detail-dialog';
import { CalendarService } from '@/features/calendar/services/calendar-service';
import { SettingsService } from '@/features/settings/services/settings-service';
import {
  CalendarEvent,
  CalendarViewMode,
  CalendarEventType,
  CalendarKPIs,
} from '@/features/calendar/types/calendar-types';
import { CalendarEventFormValues } from '@/features/calendar/schemas/calendar-event-schemas';
import { useToast } from '@/providers/toast-provider';
import { Loader2, CalendarDays, Video, Flag, CheckSquare } from 'lucide-react';

export default function CalendarHubPage() {
  const { success, error: toastError } = useToast();

  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  const [viewMode, setViewMode] = React.useState<CalendarViewMode>('MONTH');
  const [weekStartDay, setWeekStartDay] = React.useState<'MONDAY' | 'SUNDAY'>('MONDAY');
  const [workingHoursStart, setWorkingHoursStart] = React.useState('09:00');
  const [workingHoursEnd, setWorkingHoursEnd] = React.useState('18:00');

  const [events, setEvents] = React.useState<CalendarEvent[]>([]);
  const [kpis, setKpis] = React.useState<CalendarKPIs>({
    totalEvents: 0,
    upcomingMeetings: 0,
    projectDeadlines: 0,
    taskDeadlines: 0,
    clientMeetings: 0,
  });

  const [selectedType, setSelectedType] = React.useState<'ALL' | CalendarEventType>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);

  // Dialog States
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [eventToEdit, setEventToEdit] = React.useState<CalendarEvent | null>(null);
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null);
  const [dialogInitialDate, setDialogInitialDate] = React.useState<Date | undefined>(undefined);
  const [dialogInitialHour, setDialogInitialHour] = React.useState<number | undefined>(undefined);

  // Load User Preferences & Calendar Data
  const loadData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // Load user settings if available
      try {
        const calSettings = await SettingsService.getCalendarSettings();
        if (calSettings.defaultView) {
          setViewMode(calSettings.defaultView === 'AGENDA' ? 'DAY' : calSettings.defaultView);
        }
        if (calSettings.weekStartDay) {
          setWeekStartDay(calSettings.weekStartDay);
        }
        if (calSettings.workingHoursStart) setWorkingHoursStart(calSettings.workingHoursStart);
        if (calSettings.workingHoursEnd) setWorkingHoursEnd(calSettings.workingHoursEnd);
      } catch {
        // Fallback
      }

      // Load events
      const data = await CalendarService.getEvents({
        search: searchQuery,
        eventType: selectedType,
      });
      setEvents(data.events);
      setKpis(data.kpis);
    } catch (err: any) {
      toastError('Failed to load calendar', err.message || 'Error fetching calendar events.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedType, toastError]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Navigation handlers
  const handlePrev = () => {
    const nextDate = new Date(currentDate);
    if (viewMode === 'MONTH') {
      nextDate.setMonth(nextDate.getMonth() - 1);
    } else if (viewMode === 'WEEK') {
      nextDate.setDate(nextDate.getDate() - 7);
    } else {
      nextDate.setDate(nextDate.getDate() - 1);
    }
    setCurrentDate(nextDate);
  };

  const handleNext = () => {
    const nextDate = new Date(currentDate);
    if (viewMode === 'MONTH') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (viewMode === 'WEEK') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else {
      nextDate.setDate(nextDate.getDate() + 1);
    }
    setCurrentDate(nextDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Create & Edit Handlers
  const handleOpenCreateOnDate = (date: Date, hour?: number) => {
    setDialogInitialDate(date);
    setDialogInitialHour(hour);
    setEventToEdit(null);
    setIsCreateOpen(true);
  };

  const handleFormSubmit = async (values: CalendarEventFormValues) => {
    if (eventToEdit) {
      const updated = await CalendarService.updateEvent(eventToEdit.id, values);
      success('Event updated', `"${updated.title}" has been updated.`);
    } else {
      const created = await CalendarService.createEvent(values);
      success('Event scheduled', `"${created.title}" has been added to the calendar.`);
    }
    await loadData();
  };

  const handleDeleteEvent = async (id: string) => {
    await CalendarService.deleteEvent(id);
    success('Event deleted', 'The calendar event was removed.');
    await loadData();
  };

  return (
    <ContentContainer>
      <PageHeader
        title="Calendar & Scheduling Hub"
        description="Unified enterprise schedule aggregating CRM meetings, client portal appointments, project deadlines, and task milestones."
        breadcrumbs={[{ label: 'Calendar' }]}
      />

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="p-3.5 bg-card/60 backdrop-blur-xs border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Total Scheduled</p>
              <p className="text-lg font-bold text-foreground">{kpis.totalEvents}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3.5 bg-card/60 backdrop-blur-xs border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Video className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Client Meetings</p>
              <p className="text-lg font-bold text-foreground">{kpis.clientMeetings}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3.5 bg-card/60 backdrop-blur-xs border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Flag className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Project Deadlines</p>
              <p className="text-lg font-bold text-foreground">{kpis.projectDeadlines}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3.5 bg-card/60 backdrop-blur-xs border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Task Deadlines</p>
              <p className="text-lg font-bold text-foreground">{kpis.taskDeadlines}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Calendar Controls & Views Container */}
      <div className="space-y-4">
        {/* Calendar View Header */}
        <CalendarViewHeader
          currentDate={currentDate}
          viewMode={viewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onViewModeChange={setViewMode}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={handleToday}
          onOpenCreateDialog={() => handleOpenCreateOnDate(currentDate)}
        />

        {/* Filter Bar */}
        <CalendarFilterBar
          selectedType={selectedType}
          onSelectType={setSelectedType}
          counts={{
            all: kpis.totalEvents,
            clientMeetings: kpis.clientMeetings,
            internalMeetings: kpis.upcomingMeetings,
            projectDeadlines: kpis.projectDeadlines,
            taskDeadlines: kpis.taskDeadlines,
            followUps: events.filter((e) => e.eventType === 'FOLLOW_UP').length,
          }}
        />

        {/* Calendar View Body */}
        {isLoading ? (
          <Card className="p-16 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </Card>
        ) : (
          <div>
            {viewMode === 'MONTH' && (
              <MonthView
                currentDate={currentDate}
                events={events}
                weekStartDay={weekStartDay}
                onSelectEvent={setSelectedEvent}
                onSelectDate={(d) => handleOpenCreateOnDate(d)}
              />
            )}

            {viewMode === 'WEEK' && (
              <WeekView
                currentDate={currentDate}
                events={events}
                weekStartDay={weekStartDay}
                workingHoursStart={workingHoursStart}
                workingHoursEnd={workingHoursEnd}
                onSelectEvent={setSelectedEvent}
                onSelectTimeSlot={(d, h) => handleOpenCreateOnDate(d, h)}
              />
            )}

            {viewMode === 'DAY' && (
              <DayView
                currentDate={currentDate}
                events={events}
                onSelectEvent={setSelectedEvent}
                onOpenCreateDialog={() => handleOpenCreateOnDate(currentDate)}
              />
            )}
          </div>
        )}
      </div>

      {/* Event Create / Edit Dialog */}
      <EventDialog
        isOpen={isCreateOpen}
        eventToEdit={eventToEdit}
        initialDate={dialogInitialDate}
        initialHour={dialogInitialHour}
        onClose={() => {
          setIsCreateOpen(false);
          setEventToEdit(null);
        }}
        onSubmit={handleFormSubmit}
      />

      {/* Event Details Modal */}
      <EventDetailDialog
        isOpen={Boolean(selectedEvent)}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onEdit={(evt) => {
          setSelectedEvent(null);
          setEventToEdit(evt);
          setIsCreateOpen(true);
        }}
        onDelete={handleDeleteEvent}
      />
    </ContentContainer>
  );
}
