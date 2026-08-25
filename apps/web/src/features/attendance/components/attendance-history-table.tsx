'use client';

import * as React from 'react';
import { AttendanceRecord, AttendanceStatus } from '../types/attendance-types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AttendanceService } from '../services/attendance-service';
import { Search, Calendar } from 'lucide-react';

interface AttendanceHistoryTableProps {
  records: AttendanceRecord[];
  summary: {
    totalDays: number;
    presentDays: number;
    lateDays: number;
    halfDays: number;
    totalWorkingHours: number;
  };
  searchQuery: string;
  statusFilter: 'ALL' | AttendanceStatus;
  onSearchChange: (q: string) => void;
  onStatusFilterChange: (s: 'ALL' | AttendanceStatus) => void;
}

export function AttendanceHistoryTable({
  records,
  summary,
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
}: AttendanceHistoryTableProps) {
  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'PRESENT':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
            Present
          </Badge>
        );
      case 'LATE':
        return (
          <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]">
            Late
          </Badge>
        );
      case 'HALF_DAY':
        return (
          <Badge className="bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 text-[10px]">
            Half Day
          </Badge>
        );
      case 'ON_LEAVE':
        return (
          <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 text-[10px]">
            On Leave
          </Badge>
        );
      case 'ABSENT':
      default:
        return (
          <Badge variant="destructive" className="text-[10px]">
            Absent
          </Badge>
        );
    }
  };

  const formatTimeOnly = (isoString: string | null) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="border-border shadow-xs">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold text-foreground">Attendance History</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Personal verified log of clock-in and clock-out timestamps and working hours.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-48">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search notes/date..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="h-8 pl-8 text-xs w-full"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as any)}
              className="h-8 bg-background border border-border rounded-md px-2 text-xs font-medium focus:outline-hidden"
            >
              <option value="ALL">All Statuses</option>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="HALF_DAY">Half Day</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="ABSENT">Absent</option>
            </select>
          </div>
        </div>

        {/* History Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3">
          <div className="p-2.5 rounded-lg border border-border bg-muted/20 text-center">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase">Total Days</span>
            <p className="text-base font-bold text-foreground">{summary.totalDays}</p>
          </div>
          <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 text-center">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Present</span>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{summary.presentDays}</p>
          </div>
          <div className="p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-center">
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase">Late Count</span>
            <p className="text-base font-bold text-amber-600 dark:text-amber-400">{summary.lateDays}</p>
          </div>
          <div className="p-2.5 rounded-lg border border-primary/20 bg-primary/5 text-center">
            <span className="text-[10px] text-primary font-semibold uppercase">Total Working Hours</span>
            <p className="text-base font-bold text-primary">{summary.totalWorkingHours} hrs</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Clock In</th>
                <th className="py-3 px-4">Clock Out</th>
                <th className="py-3 px-4">Working Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No attendance records found matching your filters.
                  </td>
                </tr>
              ) : (
                records.map((r) => {
                  const dateObj = new Date(`${r.date}T00:00:00`);
                  const formattedDate = dateObj.toLocaleDateString([], {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-foreground whitespace-nowrap flex items-center space-x-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span>{formattedDate}</span>
                      </td>
                      <td className="py-3 px-4 font-mono">{formatTimeOnly(r.clockIn)}</td>
                      <td className="py-3 px-4 font-mono">{formatTimeOnly(r.clockOut)}</td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {r.workingMinutes > 0 ? AttendanceService.formatMinutes(r.workingMinutes) : '—'}
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(r.status)}</td>
                      <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">
                        {r.notes || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
