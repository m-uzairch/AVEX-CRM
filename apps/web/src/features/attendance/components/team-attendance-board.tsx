'use client';

import * as React from 'react';
import { TeamMemberAttendance, AttendanceKPIs } from '../types/attendance-types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { AttendanceService } from '../services/attendance-service';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Search,
  Download,
  Edit2,
  UserX,
} from 'lucide-react';

interface TeamAttendanceBoardProps {
  team: TeamMemberAttendance[];
  kpis: AttendanceKPIs;
  selectedDate: string;
  onDateChange: (d: string) => void;
  onOpenAdjust: (userId?: string) => void;
}

export function TeamAttendanceBoard({
  team,
  kpis,
  selectedDate,
  onDateChange,
  onOpenAdjust,
}: TeamAttendanceBoardProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const filteredTeam = team.filter(
    (t) =>
      t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (member: TeamMemberAttendance) => {
    if (member.currentStatus === 'ON_LEAVE') {
      return (
        <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 text-[10px]">
          On Leave
        </Badge>
      );
    }
    if (member.currentStatus === 'CLOCKED_IN') {
      return (
        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[10px]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
          Active Clock-in
        </Badge>
      );
    }
    if (member.currentStatus === 'CLOCKED_OUT') {
      return (
        <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 text-[10px]">
          Completed
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-muted-foreground text-[10px]">
        Not Clocked In
      </Badge>
    );
  };

  const handleExportCSV = () => {
    const headers = ['Employee Name', 'Email', 'Role', 'Date', 'Clock In', 'Clock Out', 'Status', 'Working Minutes'];
    const rows = filteredTeam.map((t) => [
      t.fullName,
      t.email,
      t.role,
      selectedDate,
      t.clockInTime ? new Date(t.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
      t.clockOutTime ? new Date(t.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
      t.todayRecord?.status || t.currentStatus,
      t.workingMinutes.toString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance_report_${selectedDate}.csv`;
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Presence KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-3.5 bg-card/60 backdrop-blur-xs border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Total Team</p>
              <p className="text-lg font-bold text-foreground">{kpis.totalEmployees}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3.5 bg-card/60 backdrop-blur-xs border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Present Today</p>
              <p className="text-lg font-bold text-foreground">{kpis.presentToday}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3.5 bg-card/60 backdrop-blur-xs border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Late Arrivals</p>
              <p className="text-lg font-bold text-foreground">{kpis.lateArrivals}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3.5 bg-card/60 backdrop-blur-xs border-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
              <UserX className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-muted-foreground">Missing Clock-in</p>
              <p className="text-lg font-bold text-foreground">{kpis.absentCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Team Table Card */}
      <Card className="border-border shadow-xs">
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground">Team Daily Presence Roster</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time presence tracking, working durations, and attendance adjustments.
              </p>
            </div>

            {/* Date Picker & Controls */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-44">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search employee..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs w-full"
                />
              </div>

              <div className="flex items-center space-x-1.5 border border-border rounded-md px-2 py-1 bg-card">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="text-xs bg-transparent border-0 focus:outline-hidden font-medium"
                />
              </div>

              <Button size="sm" variant="outline" onClick={handleExportCSV} className="h-8 text-xs">
                <Download className="h-3.5 w-3.5 mr-1" />
                <span>Export CSV</span>
              </Button>

              <Button size="sm" onClick={() => onOpenAdjust()} className="h-8 text-xs">
                + Adjust Record
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Today&apos;s Status</th>
                  <th className="py-3 px-4">Clock In</th>
                  <th className="py-3 px-4">Clock Out</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTeam.map((member) => (
                  <tr key={member.userId} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2.5">
                        <Avatar fallback={member.fullName} size="sm" />
                        <div>
                          <p className="font-semibold text-foreground">{member.fullName}</p>
                          <p className="text-[11px] text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {member.role}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(member)}</td>
                    <td className="py-3 px-4 font-mono">
                      {member.clockInTime
                        ? new Date(member.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {member.clockOutTime
                        ? new Date(member.clockOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-foreground">
                      {member.workingMinutes > 0 ? AttendanceService.formatMinutes(member.workingMinutes) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenAdjust(member.userId)}
                        className="h-7 px-2 text-[11px]"
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        <span>Adjust</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
