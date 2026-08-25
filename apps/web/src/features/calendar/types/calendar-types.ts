export type CalendarViewMode = 'MONTH' | 'WEEK' | 'DAY';

export type CalendarEventType =
  | 'MEETING'          // Internal team meeting
  | 'CLIENT_MEETING'   // Meeting booked via Client Portal
  | 'PROJECT_DEADLINE' // Project start/completion deadline
  | 'MILESTONE'        // Project phase milestone due date
  | 'TASK'             // Task deadline
  | 'FOLLOW_UP'        // Lead or customer follow-up call
  | 'REMINDER'         // System/user reminder
  | 'EVENT';           // General company event

export type CalendarEventStatus =
  | 'SCHEDULED'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface CalendarEventAttendee {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export interface CalendarEvent {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  eventType: CalendarEventType;
  status: CalendarEventStatus;
  startTime: string; // ISO date string
  endTime: string;   // ISO date string
  allDay: boolean;
  location?: string;
  meetingLink?: string;
  linkPlatform?: string;
  isClientVisible: boolean;
  organizer?: {
    id: string;
    fullName: string;
    email: string;
  };
  attendees?: CalendarEventAttendee[];
  project?: {
    id: string;
    name: string;
    projectCode?: string;
  };
  customer?: {
    id: string;
    name: string;
    companyName?: string;
  };
  relatedTaskId?: string;
  reminderMinutes?: number;
  originSource: 'MEETING' | 'TASK' | 'PROJECT' | 'MILESTONE' | 'MANUAL';
  createdAt: string;
  updatedAt: string;
}

export interface CalendarFilterOptions {
  search?: string;
  eventType?: 'ALL' | CalendarEventType;
  projectId?: string;
  startDate?: string;
  endDate?: string;
}

export interface CalendarKPIs {
  totalEvents: number;
  upcomingMeetings: number;
  projectDeadlines: number;
  taskDeadlines: number;
  clientMeetings: number;
}
