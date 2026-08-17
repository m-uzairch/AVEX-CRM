'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { LeadSourceDistribution, CustomerIndustryDistribution } from '../../types/dashboard-types';
import { PieChart as PieIcon, Building2 } from 'lucide-react';

interface LeadCustomerAnalyticsProps {
  leadSources: LeadSourceDistribution[];
  customerIndustries: CustomerIndustryDistribution[];
  isLoading?: boolean;
}

const DEFAULT_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#64748B'];

export function LeadCustomerAnalytics({
  leadSources,
  customerIndustries,
  isLoading = false,
}: LeadCustomerAnalyticsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="animate-pulse bg-muted/40 h-64 rounded-xl border border-border" />
        <div className="animate-pulse bg-muted/40 h-64 rounded-xl border border-border" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
      {/* Lead Sources Distribution */}
      <Card className="shadow-2xs border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center space-x-2">
            <PieIcon className="h-4 w-4 text-blue-500" />
            <span>Leads by Acquisition Source</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Distribution of leads generated across inbound channels.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="h-52 w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadSources}
                    dataKey="count"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {leadSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--popover)',
                      borderColor: 'var(--border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    formatter={(value: unknown) => [`${value} leads`, 'Volume']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="w-full sm:w-1/2 space-y-2 border-t sm:border-t-0 sm:border-l border-border/60 pt-3 sm:pt-0 sm:pl-4">
              {leadSources.map((src, i) => (
                <div key={src.source} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 truncate">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: src.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
                    />
                    <span className="font-medium text-foreground truncate">{src.source}</span>
                  </div>
                  <div className="flex items-center space-x-2 font-mono shrink-0">
                    <span className="text-foreground font-semibold">{src.count}</span>
                    <span className="text-muted-foreground text-[11px]">({src.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Industry Distribution */}
      <Card className="shadow-2xs border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-purple-500" />
            <span>Customers by Industry Segment</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Client distribution across key industry sectors.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2 space-y-3">
          {customerIndustries.map((ind, idx) => (
            <div key={ind.industry} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">{ind.industry}</span>
                <span className="font-mono text-muted-foreground">
                  <strong className="text-foreground">{ind.count}</strong> accounts ({ind.percentage}%)
                </span>
              </div>

              {/* Progress bar indicator */}
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(ind.percentage, 100)}%`,
                    backgroundColor: DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
                  }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
