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
    value: '0',
    change: '0 active',
    trend: 'neutral',
    description: 'Active client company profiles',
    category: 'customers',
  },
  {
    id: 'stat_2',
    title: 'Active Projects',
    value: '0',
    change: '0 in progress',
    trend: 'neutral',
    description: 'Ongoing customer implementations',
    category: 'projects',
  },
  {
    id: 'stat_3',
    title: 'Monthly Revenue',
    value: '$0',
    change: '$0 revenue',
    trend: 'neutral',
    description: 'Paid invoices & won deals',
    category: 'revenue',
  },
  {
    id: 'stat_4',
    title: 'Pending Tasks',
    value: '0',
    change: '0 open',
    trend: 'neutral',
    description: 'Action items requiring team attention',
    category: 'tasks',
  },
];

export const MOCK_ACTIVITIES: ActivityItemData[] = [];
export const MOCK_TASKS: TaskItemData[] = [];
export const MOCK_MEETINGS: CalendarEventData[] = [];
export const MOCK_NOTIFICATIONS: NotificationItemData[] = [];
