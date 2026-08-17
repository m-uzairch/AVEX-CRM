/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import Link from 'next/link';
import { TopCustomerRevenueItem } from '../types/financial-dashboard-types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface TopCustomersTableProps {
  data: TopCustomerRevenueItem[];
}

export function TopCustomersTable({ data }: TopCustomersTableProps) {
  return (
    <Card className="shadow-2xs border-border">
      <CardHeader className="pb-3 border-b border-border/60">
        <CardTitle className="text-sm font-bold flex items-center space-x-2">
          <Users className="h-4 w-4 text-emerald-500" />
          <span>Top Revenue Client Accounts</span>
        </CardTitle>
        <CardDescription className="text-xs">
          High-value client profiles ranked by lifetime payments and outstanding balances
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {data.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-xs">No client account financial history.</div>
        ) : (
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-4">Client Account</th>
                  <th className="py-3 px-4 text-right">Invoices</th>
                  <th className="py-3 px-4 text-right">Paid Amount</th>
                  <th className="py-3 px-4 text-right">Outstanding</th>
                  <th className="py-3 px-4 text-right">Lifetime Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data.map((cust) => (
                  <tr key={cust.customerId} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground">
                      <Link href={`/crm/${cust.customerId}`} className="hover:underline text-primary">
                        {cust.companyName || cust.customerName}
                      </Link>
                      <div className="text-[10px] text-muted-foreground font-normal">{cust.customerName}</div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                      {cust.invoicesCount}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ${cust.paidAmount.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-semibold text-rose-600 dark:text-rose-400">
                      ${cust.outstandingBalance.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-extrabold text-foreground">
                      ${cust.lifetimeRevenue.toFixed(2)}
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
