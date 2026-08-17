import { format, formatDistanceToNow } from 'date-fns';

export function formatDate(date: Date | string | number, formatStr = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return format(d, formatStr);
}

export function formatRelativeTime(date: Date | string | number): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}
