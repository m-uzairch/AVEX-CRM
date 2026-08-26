'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { EmployeeDetailResponse } from '../types/employee-types';
import {
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Edit2,
} from 'lucide-react';
import { EmployeeDialog } from './employee-dialog';

interface EmployeeDetailViewProps {
  detail: EmployeeDetailResponse;
  isAdmin: boolean;
  onRefresh: () => void;
}

export function EmployeeDetailView({
  detail,
  isAdmin,
  onRefresh,
}: EmployeeDetailViewProps) {
  const { employee, assignedTasks, attendanceSummary } = detail;
  const [isEditOpen, setIsEditOpen] = React.useState(false);

  const initials = employee.fullName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const getStatusBadge = () => {
    switch (employee.employmentStatus) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Active Employee
          </span>
        );
      case 'ON_LEAVE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            On Leave
          </span>
        );
      case 'TERMINATED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            Terminated
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/employees">
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Directory
            </Button>
          </Link>
        </div>

        {isAdmin && (
          <Button size="sm" onClick={() => setIsEditOpen(true)} className="gap-1.5 text-xs">
            <Edit2 className="h-3.5 w-3.5" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Header Card */}
      <Card className="border border-border/80 shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <Avatar
                src={employee.avatarUrl || undefined}
                fallback={initials}
                size="lg"
                className="border-2 border-border shadow-sm"
              />
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl font-bold text-foreground">{employee.fullName}</h1>
                  {getStatusBadge()}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5 text-muted-foreground/70" />
                    {employee.role}
                  </span>
                  {employee.department && (
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-muted-foreground/70" />
                      {employee.department}
                    </span>
                  )}
                  {employee.hireDate && (
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground/70" />
                      Hired {new Date(employee.hireDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 text-xs border-t md:border-t-0 md:border-l border-border/60 pt-4 md:pt-0 md:pl-6">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="font-mono text-foreground select-all">{employee.email}</span>
                </div>
                {employee.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5" />
                    <span className="font-mono text-foreground select-all">{employee.phone}</span>
                  </div>
                )}
                {employee.user ? (
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>CRM User Account Linked</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Directory Only (No Login Account)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Assigned Tasks & Attendance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Assigned Tasks */}
        <Card className="border border-border/80 shadow-sm flex flex-col">
          <CardHeader className="p-4 pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Assigned Tasks
                </CardTitle>
                <CardDescription className="text-xs">
                  Active project tasks assigned to this employee.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="font-mono text-xs">
                {assignedTasks.length} {assignedTasks.length === 1 ? 'task' : 'tasks'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {assignedTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No active tasks assigned to this employee.
              </div>
            ) : (
              <div className="divide-y divide-border/40 text-xs">
                {assignedTasks.map((task) => (
                  <div key={task.id} className="p-3.5 hover:bg-muted/20 transition-colors flex items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{task.title}</p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        {task.project?.name && (
                          <span className="truncate max-w-[140px] text-primary/80">
                            {task.project.name}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className="font-mono">
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground">
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Attendance Summary */}
        <Card className="border border-border/80 shadow-sm flex flex-col">
          <CardHeader className="p-4 pb-3 border-b border-border/60">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-600" />
                  Attendance & Time Summary
                </CardTitle>
                <CardDescription className="text-xs">
                  Presence record, shifts, and logged working hours.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="font-mono text-xs">
                {attendanceSummary.totalWorkingHours} hrs
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-4 flex-1">
            {/* KPI Roster Mini-Cards */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 rounded-lg bg-muted/40 border border-border/40">
                <span className="text-[10px] text-muted-foreground block uppercase">Recorded</span>
                <span className="text-sm font-bold font-mono text-foreground">{attendanceSummary.totalDays}</span>
              </div>
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] text-emerald-600 block uppercase">Present</span>
                <span className="text-sm font-bold font-mono text-emerald-600">{attendanceSummary.presentDays}</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="text-[10px] text-amber-600 block uppercase">Late</span>
                <span className="text-sm font-bold font-mono text-amber-600">{attendanceSummary.lateDays}</span>
              </div>
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-[10px] text-primary block uppercase">Hours</span>
                <span className="text-sm font-bold font-mono text-primary">{attendanceSummary.totalWorkingHours}</span>
              </div>
            </div>

            {/* Recent Check-in Records */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-foreground">Recent Check-In History</h4>
              {attendanceSummary.recentRecords.length === 0 ? (
                <p className="text-xs text-muted-foreground">No recent attendance check-in records found.</p>
              ) : (
                <div className="divide-y divide-border/40 border border-border/40 rounded-lg overflow-hidden text-xs">
                  {attendanceSummary.recentRecords.map((r) => (
                    <div key={r.id} className="p-2.5 flex items-center justify-between font-mono bg-muted/10">
                      <div>
                        <span className="font-semibold text-foreground">{r.date}</span>
                        <span className="block text-[10px] text-muted-foreground">
                          {r.clockIn ? `In: ${new Date(r.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'No clock-in'}
                          {r.clockOut ? ` • Out: ${new Date(r.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        r.status === 'PRESENT'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : r.status === 'LATE'
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {r.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {isEditOpen && (
        <EmployeeDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          employee={employee}
          onSaved={onRefresh}
        />
      )}
    </div>
  );
}
