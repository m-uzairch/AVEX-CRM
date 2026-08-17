/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import Link from 'next/link';
import { ProjectProfitabilityItem } from '../types/financial-dashboard-types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderKanban, AlertTriangle } from 'lucide-react';

interface ProjectProfitabilityTableProps {
  data: ProjectProfitabilityItem[];
}

export function ProjectProfitabilityTable({ data }: ProjectProfitabilityTableProps) {
  return (
    <Card className="shadow-2xs border-border">
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-sm font-bold flex items-center space-x-2">
          <FolderKanban className="h-4 w-4 text-purple-500" />
          <span>Project Profitability Summary</span>
        </CardTitle>
        <CardDescription className="text-xs">
          Financial performance, revenue, expenses, and net profit per project workspace
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {data.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-xs">No active project financial data.</div>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-4">Project</th>
                  <th className="py-3 px-4 text-right">Budget</th>
                  <th className="py-3 px-4 text-right">Revenue Paid</th>
                  <th className="py-3 px-4 text-right">Expenses</th>
                  <th className="py-3 px-4 text-right">Net Profit</th>
                  <th className="py-3 px-4 text-right">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data.map((proj) => (
                  <tr key={proj.projectId} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground">
                      <div className="flex items-center space-x-2">
                        <Link href={`/projects/${proj.projectId}`} className="hover:underline font-mono text-primary">
                          {proj.projectCode}
                        </Link>
                        <span>{proj.projectName}</span>
                        {proj.isOperatingAtLoss && (
                          <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[9px] font-bold gap-1">
                            <AlertTriangle className="h-2.5 w-2.5" /> LOSS
                          </Badge>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                      ${proj.budget.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ${proj.revenue.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-semibold text-purple-600 dark:text-purple-400">
                      ${proj.expenses.toFixed(2)}
                    </td>

                    <td
                      className={`py-3 px-4 text-right font-mono font-extrabold ${
                        proj.profit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600'
                      }`}
                    >
                      ${proj.profit.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                      {proj.profitMargin}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
