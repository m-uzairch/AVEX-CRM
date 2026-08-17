/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { EmployeePerformanceMetric, ResourceUtilizationMetric } from '../../types/project-report-types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, AlertTriangle, CheckCircle2, Clock, Zap } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface TeamResourceAnalyticsProps {
  teamPerformance: EmployeePerformanceMetric[];
  resourceUtilization: ResourceUtilizationMetric | null;
  isLoading?: boolean;
}

export function TeamResourceAnalytics({
  teamPerformance,
  resourceUtilization,
  isLoading,
}: TeamResourceAnalyticsProps) {
  if (isLoading) {
    return <Card className="h-64 animate-pulse bg-muted/30" />;
  }

  const chartData = teamPerformance.map((t) => ({
    name: t.fullName.split(' ')[0],
    assigned: t.assignedTasksCount,
    completed: t.completedTasksCount,
    hours: t.hoursWorked,
  }));

  return (
    <div className="space-y-6">
      {/* Top Workload Overview Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-2xs border-border bg-gradient-to-br from-blue-500/5 to-transparent">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">Total Team Members</div>
              <div className="text-xl font-bold text-foreground">
                {resourceUtilization?.totalTeamMembers || teamPerformance.length}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-border bg-gradient-to-br from-purple-500/5 to-transparent">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-500">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">Avg Workload Utilization</div>
              <div className="text-xl font-bold text-foreground">
                {resourceUtilization?.avgWorkloadPercentage || 68}%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-border bg-gradient-to-br from-amber-500/5 to-transparent">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">Overloaded Team Members</div>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {resourceUtilization?.overloadedMembersCount || 0} Members
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart & Table Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recharts Workload Distribution */}
        <Card className="lg:col-span-5 shadow-2xs border-border flex flex-col justify-between">
          <CardHeader className="pb-2 border-b border-border/60">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Employee Productivity & Hours Logged</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Comparison of task count vs hours logged per employee.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="completed" fill="#10B981" name="Completed Tasks" radius={[4, 4, 0, 0]} />
                <Bar dataKey="hours" fill="#3B82F6" name="Hours Logged" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Detailed Employee Table */}
        <Card className="lg:col-span-7 shadow-2xs border-border">
          <CardHeader className="pb-3 border-b border-border/60">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span>Employee Performance & Capacity Report</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Task distribution, average completion time, and workload capacity status.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-2">Assigned</th>
                  <th className="py-2.5 px-2">Completed</th>
                  <th className="py-2.5 px-2">Hours Worked</th>
                  <th className="py-2.5 px-2">Avg Speed</th>
                  <th className="py-2.5 px-3 text-right">Capacity Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {teamPerformance.map((emp) => (
                  <tr key={emp.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-foreground">{emp.fullName}</div>
                      <div className="text-[10px] text-muted-foreground">{emp.email}</div>
                    </td>

                    <td className="py-2.5 px-2 font-medium">{emp.assignedTasksCount} tasks</td>

                    <td className="py-2.5 px-2 font-medium text-emerald-600 dark:text-emerald-400">
                      {emp.completedTasksCount} tasks
                    </td>

                    <td className="py-2.5 px-2 font-semibold">{emp.hoursWorked} hrs</td>

                    <td className="py-2.5 px-2 text-muted-foreground">
                      {emp.averageTaskCompletionHours} hrs / task
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      {emp.isOverloaded ? (
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Overloaded</span>
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Optimal ({emp.availableCapacityPercentage}% free)</span>
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
