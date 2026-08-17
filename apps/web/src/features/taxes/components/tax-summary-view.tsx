'use client';

import * as React from 'react';
import { TaxSummary, DiscountSummary } from '../types/tax-types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Percent, TrendingUp, Tag, PieChart, Building2, FolderKanban } from 'lucide-react';

interface TaxSummaryViewProps {
  taxSummary: TaxSummary | null;
  discountSummary: DiscountSummary | null;
  loading: boolean;
}

export function TaxSummaryView({
  taxSummary,
  discountSummary,
  loading,
}: TaxSummaryViewProps) {
  if (loading) {
    return <div className="text-center py-12 text-slate-500">Loading tax and discount reports...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50/40 dark:from-slate-900 dark:to-blue-950/30 border-blue-200/60 dark:border-blue-900/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-blue-900 dark:text-blue-200 uppercase tracking-wider">
              Total Tax Collected
            </CardTitle>
            <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              ${taxSummary?.totalTaxCollected.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 inline text-emerald-500" /> Across all invoices & completed sales
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50/40 dark:from-slate-900 dark:to-emerald-950/30 border-emerald-200/60 dark:border-emerald-900/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 uppercase tracking-wider">
              Total Discounts Given
            </CardTitle>
            <Tag className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              ${discountSummary?.totalDiscountsGiven.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
              Promotional rebates & line item savings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Active Configured Rates
            </CardTitle>
            <Percent className="h-5 w-5 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {taxSummary?.activeTaxesCount || 0} Rates
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {taxSummary?.templatesCount || 0} active tax templates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Active Discount Rules
            </CardTitle>
            <PieChart className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {discountSummary?.activeRulesCount || 0} Active Rules
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {discountSummary?.activeDiscountsCount || 0} general discount codes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tax Breakdown Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tax Applied per Invoice */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" /> Tax Breakdown by Recent Invoices
          </h4>
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-950">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Tax</TableHead>
                  <TableHead className="text-right">Grand Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxSummary?.recentAppliedTaxes.map((row) => (
                  <TableRow key={row.invoiceNumber}>
                    <TableCell className="font-medium text-blue-600">{row.invoiceNumber}</TableCell>
                    <TableCell>{row.customerName}</TableCell>
                    <TableCell className="font-semibold text-emerald-600">${row.taxAmount.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-bold">${row.grandTotal.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Discounts by Customer & Project */}
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FolderKanban className="h-4 w-4 text-emerald-600" /> Top Customer Discount Distribution
          </h4>
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-slate-950">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Name</TableHead>
                  <TableHead className="text-right">Total Discount Conceded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discountSummary?.discountsByCustomer.map((c) => (
                  <TableRow key={c.customerId}>
                    <TableCell className="font-medium text-slate-900 dark:text-slate-100">{c.customerName}</TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600">
                      ${c.discountAmount.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
