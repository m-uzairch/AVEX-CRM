/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, ArrowRight, Building } from 'lucide-react';
import Link from 'next/link';

interface RecentRecordsWidgetProps {
  recentCustomers?: any[];
  recentLeads?: any[];
  isLoading?: boolean;
}

export function RecentRecordsWidget({
  recentCustomers = [],
  recentLeads = [],
  isLoading = false,
}: RecentRecordsWidgetProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="animate-pulse bg-muted/40 h-56 rounded-xl border border-border" />
        <div className="animate-pulse bg-muted/40 h-56 rounded-xl border border-border" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
      {/* Recent Customers */}
      <Card className="shadow-2xs border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
          <div>
            <CardTitle className="text-base font-bold flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span>Recent Customers</span>
            </CardTitle>
            <CardDescription className="text-xs">Newly created company client profiles.</CardDescription>
          </div>
          <Link href="/crm/customers">
            <span className="text-primary hover:underline text-xs font-semibold flex items-center">
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </span>
          </Link>
        </CardHeader>

        <CardContent className="p-3 space-y-2">
          {recentCustomers.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground space-y-1">
              <p className="font-medium text-xs">No customers added yet</p>
              <Link href="/crm/customers" className="text-primary hover:underline text-[11px] font-medium">
                Create your first customer &rarr;
              </Link>
            </div>
          ) : (
            recentCustomers.map((c) => (
              <Link key={c.id} href={`/crm/customers/${c.id}`} className="block">
                <div className="p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/40 transition-colors flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-500 font-bold flex items-center justify-center border border-blue-500/20 text-xs shrink-0">
                      {c.name ? c.name.substring(0, 2).toUpperCase() : 'CU'}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{c.name}</h4>
                      <p className="text-[11px] text-muted-foreground flex items-center space-x-1">
                        <Building className="h-3 w-3" />
                        <span>{c.companyName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <Badge variant="outline" className="text-[10px] uppercase font-mono">
                      {c.status}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground block">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent Leads */}
      <Card className="shadow-2xs border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/60">
          <div>
            <CardTitle className="text-base font-bold flex items-center space-x-2">
              <UserPlus className="h-4 w-4 text-purple-500" />
              <span>Recent Sales Prospects</span>
            </CardTitle>
            <CardDescription className="text-xs">Latest leads captured in sales pipeline.</CardDescription>
          </div>
          <Link href="/crm/leads">
            <span className="text-primary hover:underline text-xs font-semibold flex items-center">
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </span>
          </Link>
        </CardHeader>

        <CardContent className="p-3 space-y-2">
          {recentLeads.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground space-y-1">
              <p className="font-medium text-xs">No leads added yet</p>
              <Link href="/crm/leads" className="text-primary hover:underline text-[11px] font-medium">
                Create your first lead &rarr;
              </Link>
            </div>
          ) : (
            recentLeads.map((l) => (
              <Link key={l.id} href={`/crm/leads/${l.id}`} className="block">
                <div className="p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/40 transition-colors flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-purple-500/10 text-purple-500 font-bold flex items-center justify-center border border-purple-500/20 text-xs shrink-0">
                      {l.name ? l.name.substring(0, 2).toUpperCase() : 'LD'}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">{l.name}</h4>
                      <p className="text-[11px] text-muted-foreground">{l.companyName}</p>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="flex items-center space-x-1 justify-end">
                      <Badge variant="outline" className="text-[10px] uppercase font-mono">
                        {l.status}
                      </Badge>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] font-bold font-mono">
                        Score: {l.score}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground block">
                      Assigned: {l.assignedName || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
