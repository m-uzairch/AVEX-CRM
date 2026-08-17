/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { TimeTrackingMetric, BudgetReportMetric } from '../../types/project-report-types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Clock, DollarSign, TrendingUp, AlertCircle, PieChart as PieChartIcon } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface TimeBudgetAnalyticsProps {
  timeTracking: TimeTrackingMetric | null;
  budgetReports: BudgetReportMetric | null;
  isLoading?: boolean;
}

export function TimeBudgetAnalytics({
  timeTracking,
  budgetReports,
  isLoading,
}: TimeBudgetAnalyticsProps) {
  if (isLoading || !timeTracking || !budgetReports) {
    return <Card className="h-64 animate-pulse bg-muted/30" />;
  }

  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'];

  const budgetPieData = budgetReports.projectBudgets.slice(0, 5).map((pb, i) => ({
    name: pb.projectCode,
    value: pb.estimatedBudget,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-2xs border-border">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">Total Hours Logged</div>
              <div className="text-xl font-bold text-foreground">{timeTracking.totalHoursLogged} hrs</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-border">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">Avg Task Duration</div>
              <div className="text-xl font-bold text-foreground">{timeTracking.averageTaskDurationHours} hrs</div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-border">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">Total Budget Allocated</div>
              <div className="text-xl font-bold text-foreground">
                ${budgetReports.totalEstimatedBudget.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-border">
          <CardContent className="p-4 flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-500">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-muted-foreground">Total Budget Used</div>
              <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                ${budgetReports.totalBudgetUsed.toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Hours Logged by Project Bar Chart */}
        <Card className="md:col-span-7 shadow-2xs border-border">
          <CardHeader className="pb-2 border-b border-border/60">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Hours Logged by Project</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Time tracking distribution across top active projects.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 h-[270px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeTracking.hoursByProject} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="projectCode" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="hours" fill="#8B5CF6" name="Logged Hours" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Budget Distribution Pie Chart */}
        <Card className="md:col-span-5 shadow-2xs border-border">
          <CardHeader className="pb-2 border-b border-border/60">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-primary" />
              <span>Budget Allocation Distribution</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Share of total budget across key projects.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 h-[270px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetPieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={50}
                  paddingAngle={4}
                >
                  {budgetPieData.map((entry, index) => (
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
      </div>

      {/* Budget Variance Table */}
      <Card className="shadow-2xs border-border">
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span>Project Budget & Variance Details</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Estimated budget, actual usage, remaining funds, and variance percentages.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-muted/40 border-b border-border text-muted-foreground font-semibold">
                <th className="py-2.5 px-4">Project</th>
                <th className="py-2.5 px-3">Estimated Budget</th>
                <th className="py-2.5 px-3">Budget Used</th>
                <th className="py-2.5 px-3">Remaining Budget</th>
                <th className="py-2.5 px-4 text-right">Variance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {budgetReports.projectBudgets.map((pb) => (
                <tr key={pb.projectId} className="hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 px-4">
                    <div className="font-bold text-foreground">{pb.projectName}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{pb.projectCode}</div>
                  </td>
                  <td className="py-2.5 px-3 font-medium">${pb.estimatedBudget.toLocaleString()}</td>
                  <td className="py-2.5 px-3 font-medium text-orange-600 dark:text-orange-400">
                    ${pb.budgetUsed.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-emerald-600 dark:text-emerald-400">
                    ${pb.remainingBudget.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 text-right font-semibold">
                    {pb.isOverBudget ? (
                      <span className="text-rose-600 dark:text-rose-400">Over Budget (+{Math.abs(pb.variancePercentage)}%)</span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400">Under Budget ({pb.variancePercentage}%)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
