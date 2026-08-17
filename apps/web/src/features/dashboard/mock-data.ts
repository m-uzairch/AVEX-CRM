export interface StatMetric {
  id: string;
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  description: string;
  category: string;
}

export interface ActivityItemData {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  type: 'customer' | 'invoice' | 'attendance' | 'project';
}

export interface TaskItemData {
  id: string;
  title: string;
  dueDate: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  project: string;
  completed: boolean;
}

export interface CalendarEventData {
  id: string;
  title: string;
  time: string;
  location: string;
  type: 'meeting' | 'call' | 'review';
}

export interface NotificationItemData {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

export const MOCK_DASHBOARD_STATS: StatMetric[] = [
  {
    id: 'stat_1',
    title: 'Total Customers',
    value: '1,420',
    change: '+4.2%',
    trend: 'up',
    description: '18 new this week',
    category: 'customers',
  },
  {
    id: 'stat_2',
    title: 'Active Projects',
    value: '38',
    change: '-2',
    trend: 'down',
    description: '4 completed this month',
    category: 'projects',
  },
  {
    id: 'stat_3',
    title: 'Monthly Revenue',
    value: '$124,500',
    change: '+12.5%',
    trend: 'up',
    description: 'vs last month',
    category: 'revenue',
  },
  {
    id: 'stat_4',
    title: 'Pending Tasks',
    value: '14',
    change: '+3',
    trend: 'neutral',
    description: '5 high priority',
    category: 'tasks',
  },
];

export const MOCK_ACTIVITIES: ActivityItemData[] = [
  {
    id: 'act_1',
    title: 'Acme Software Redesign Contract Signed',
    subtitle: 'Acme Corp • $18,500',
    time: '10 minutes ago',
    type: 'customer',
  },
  {
    id: 'act_2',
    title: 'Invoice #INV-2026-042 Paid in Full',
    subtitle: 'Global Retail Inc • $6,400',
    time: '1 hour ago',
    type: 'invoice',
  },
  {
    id: 'act_3',
    title: 'Employee Check-in Logged',
    subtitle: 'Sarah Jenkins checked in at 9:00 AM',
    time: '2 hours ago',
    type: 'attendance',
  },
  {
    id: 'act_4',
    title: 'Cloud Infrastructure Milestone 2 Completed',
    subtitle: 'Starlight Media Project',
    time: '4 hours ago',
    type: 'project',
  },
];

export const MOCK_TASKS: TaskItemData[] = [
  {
    id: 'task_1',
    title: 'Finalize Q3 Sales Forecast Report',
    dueDate: 'Today, 5:00 PM',
    priority: 'HIGH',
    project: 'Business Intelligence',
    completed: false,
  },
  {
    id: 'task_2',
    title: 'Review Client Onboarding Feedback for Acme',
    dueDate: 'Tomorrow',
    priority: 'MEDIUM',
    project: 'CRM Operations',
    completed: false,
  },
  {
    id: 'task_3',
    title: 'Approve Employee Shift Schedules for August',
    dueDate: 'Aug 2, 2026',
    priority: 'HIGH',
    project: 'HR & Attendance',
    completed: false,
  },
  {
    id: 'task_4',
    title: 'Send Monthly Invoices to Retainer Accounts',
    dueDate: 'Aug 5, 2026',
    priority: 'LOW',
    project: 'Finance & Billing',
    completed: false,
  },
];

export const MOCK_MEETINGS: CalendarEventData[] = [
  {
    id: 'evt_1',
    title: 'Sprint Architecture Review',
    time: '10:00 AM - 11:00 AM',
    location: 'Conference Room A',
    type: 'review',
  },
  {
    id: 'evt_2',
    title: 'Acme Corp Client Onboarding Call',
    time: '2:00 PM - 3:00 PM',
    location: 'Google Meet',
    type: 'meeting',
  },
  {
    id: 'evt_3',
    title: 'Weekly Executive Sales Sync',
    time: '4:30 PM - 5:00 PM',
    location: 'Executive Boardroom',
    type: 'call',
  },
];

export const MOCK_NOTIFICATIONS: NotificationItemData[] = [
  {
    id: 'notif_1',
    title: 'New Lead Assigned',
    description: 'High-value lead "Starlight Media" assigned to your queue.',
    time: '15m ago',
    unread: true,
  },
  {
    id: 'notif_2',
    title: 'Meeting Tomorrow',
    description: 'Client onboarding meeting with Acme Corp at 2:00 PM.',
    time: '1h ago',
    unread: true,
  },
  {
    id: 'notif_3',
    title: 'Invoice Due',
    description: 'Invoice #INV-2026-039 is due today for $9,200.',
    time: '3h ago',
    unread: false,
  },
  {
    id: 'notif_4',
    title: 'Attendance Reminder',
    description: 'All team clock-in logs for today have been verified.',
    time: '5h ago',
    unread: false,
  },
];
