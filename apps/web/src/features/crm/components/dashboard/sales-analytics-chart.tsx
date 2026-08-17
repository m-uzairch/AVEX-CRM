'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, DollarSign } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { SalesChartPoint } from '../../types/dashboard-types';

interface SalesAnalyticsChartProps {
  data: SalesChartPoint[];
  isLoading?: boolean;
}

export function SalesAnalyticsChart({ data, isLoading = false }: SalesAnalyticsChartProps) {
  const [metric, setMetric] = React.useState<'revenue' | 'sales'>('revenue');

  if (isLoading) {
    return (
      <Card className="shadow-2xs border-border">
        <CardContent className="p-6">
          <div className="animate-pulse bg-muted/40 h-72 rounded-xl border border-border" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-2xs border-border text-xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
        <div>
          <CardTitle className="text-base font-bold flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            <span>Monthly Revenue Growth & Sales Performance</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Historical revenue generation, deal velocity, and pipeline growth over time.
          </CardDescription>
        </div>

        <div className="flex items-center space-x-1.5 bg-muted p-1 rounded-lg border border-border">
          <Button
            type="button"
            variant={metric === 'revenue' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMetric('revenue')}
            className="h-7 text-xs px-2.5"
          >
            <DollarSign className="h-3 w-3 mr-1" />
            <span>Revenue ($)</span>
          </Button>

          <Button
            type="button"
            variant={metric === 'sales' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setMetric('sales')}
            className="h-7 text-xs px-2.5"
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            <span>Closed Deals</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="pipelineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
              <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) =>
                  metric === 'revenue' ? `$${(value / 1000).toFixed(0)}k` : `${value}`
                }
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--popover)',
                  borderColor: 'var(--border)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                formatter={(value: unknown, name: unknown) => [
                  metric === 'revenue' ? `$${Number(value).toLocaleString()}` : `${value} deals`,
                  name === 'revenue' ? 'Revenue' : name === 'pipeline' ? 'Pipeline Value' : name === 'sales' ? 'Closed Deals' : 'Target',
                ]}
              />

              {metric === 'revenue' ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="pipeline"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#pipelineGradient)"
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                  />
                </>
              ) : (
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#8B5CF6"
                  strokeWidth={2.5}
                  fillOpacity={0.3}
                  fill="#8B5CF6"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
