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

  const mockCust = recentCustomers.length > 0 ? recentCustomers : [
    { id: 'cust_001', name: 'Sarah Jenkins', companyName: 'Acuity Solutions', status: 'ACTIVE', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'cust_002', name: 'Michael Vance', companyName: 'Vance Tech Labs', status: 'ACTIVE', createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: 'cust_003', name: 'Elena Rostova', companyName: 'Apex Systems Inc.', status: 'PROSPECT', createdAt: new Date(Date.now() - 86400000).toISOString() },
  ];

  const mockLds = recentLeads.length > 0 ? recentLeads : [
    { id: 'lead_001', name: 'Apex Logistics Systems', companyName: 'Apex Logistics', status: 'QUALIFIED', score: 85, assignedName: 'Alex Carter' },
    { id: 'lead_002', name: 'Vance Cyber Security', companyName: 'Vance Security', status: 'PROPOSAL_SENT', score: 92, assignedName: 'Jordan Smith' },
    { id: 'lead_003', name: 'Nexus Cloud Infrastructure', companyName: 'Nexus Global', status: 'NEW', score: 64, assignedName: 'Ali Hassan' },
  ];

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
          {mockCust.map((c) => (
            <Link key={c.id} href={`/crm/customers/${c.id}`} className="block">
              <div className="p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/40 transition-colors flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-500 font-bold flex items-center justify-center border border-blue-500/20 text-xs shrink-0">
                    {c.name.substring(0, 2).toUpperCase()}
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
          ))}
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
          {mockLds.map((l) => (
            <Link key={l.id} href={`/crm/leads/${l.id}`} className="block">
              <div className="p-3 rounded-lg border border-border/60 bg-card hover:bg-muted/40 transition-colors flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-purple-500/10 text-purple-500 font-bold flex items-center justify-center border border-purple-500/20 text-xs shrink-0">
                    {l.name.substring(0, 2).toUpperCase()}
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
                    Assigned: {l.assignedName || 'Alex Carter'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
