/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { TaskAnalyticsMetric, MilestoneAnalyticsMetric } from '../../types/project-report-types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ListTodo, Flag, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

interface TaskMilestoneAnalyticsProps {
  taskAnalytics: TaskAnalyticsMetric | null;
  milestoneAnalytics: MilestoneAnalyticsMetric | null;
  isLoading?: boolean;
}

export function TaskMilestoneAnalytics({
  taskAnalytics,
  milestoneAnalytics,
  isLoading,
}: TaskMilestoneAnalyticsProps) {
  if (isLoading || !taskAnalytics || !milestoneAnalytics) {
    return <Card className="h-64 animate-pulse bg-muted/30" />;
  }

  return (
    <div className="space-y-6">
      {/* Top Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="shadow-2xs border-border">
          <CardContent className="p-3.5 flex items-center space-x-3">
            <div className="p-2 rounded-md bg-blue-500/10 text-blue-500">
              <ListTodo className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground font-medium">Total Tasks</div>
              <div className="text-lg font-bold text-foreground">{taskAnalytics.totalTasks}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-border">
          <CardContent className="p-3.5 flex items-center space-x-3">
            <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground font-medium">Completed Tasks</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {taskAnalytics.completedTasks}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-border">
          <CardContent className="p-3.5 flex items-center space-x-3">
            <div className="p-2 rounded-md bg-purple-500/10 text-purple-500">
              <Flag className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground font-medium">Total Milestones</div>
              <div className="text-lg font-bold text-foreground">
                {milestoneAnalytics.totalMilestones}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-border">
          <CardContent className="p-3.5 flex items-center space-x-3">
            <div className="p-2 rounded-md bg-amber-500/10 text-amber-500">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[11px] text-muted-foreground font-medium">Delayed Milestones</div>
              <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {milestoneAnalytics.delayedMilestones}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recharts Row 1: Tasks by Status (Pie) & Task Completion Trend (Area) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <Card className="md:col-span-5 shadow-2xs border-border">
          <CardHeader className="pb-2 border-b border-border/60">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-primary" />
              <span>Tasks by Status</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Distribution of task lifecycle statuses across workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskAnalytics.tasksByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {taskAnalytics.tasksByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-7 shadow-2xs border-border">
          <CardHeader className="pb-2 border-b border-border/60">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Task Completion Velocity</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Daily task completion rate vs new task creation rate.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={taskAnalytics.completionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="completed" stroke="#10B981" fill="#10B981" fillOpacity={0.2} name="Completed" />
                <Area type="monotone" dataKey="created" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.15} name="Created" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Milestone Progress Composed Bar Chart */}
      <Card className="shadow-2xs border-border">
        <CardHeader className="pb-2 border-b border-border/60">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Flag className="h-4 w-4 text-primary" />
            <span>Milestone Completion & Delay Trend</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Quarterly breakdown of completed milestones vs delayed milestones.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={milestoneAnalytics.completionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="period" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="completed" fill="#10B981" name="Completed Milestones" radius={[4, 4, 0, 0]} />
              <Bar dataKey="delayed" fill="#EF4444" name="Delayed Milestones" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
