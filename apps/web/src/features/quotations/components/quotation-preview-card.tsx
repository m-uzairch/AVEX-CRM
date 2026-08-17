/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { Quotation } from '../types/quotation-types';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

interface QuotationPreviewCardProps {
  quotation: Partial<Omit<Quotation, 'items'>> & { items?: any[] };
}

export function QuotationPreviewCard({ quotation }: QuotationPreviewCardProps) {
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold text-xs">ACCEPTED</Badge>;
      case 'CONVERTED':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 font-bold text-xs">CONVERTED</Badge>;
      case 'REJECTED':
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 font-bold text-xs">REJECTED</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold text-xs">EXPIRED</Badge>;
      case 'SENT':
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 font-bold text-xs">SENT</Badge>;
      case 'VIEWED':
        return <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 font-bold text-xs">VIEWED</Badge>;
      default:
        return <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20 font-bold text-xs">DRAFT</Badge>;
    }
  };

  const getExpiryDays = () => {
    if (!quotation.expiryDate) return null;
    const diffMs = new Date(quotation.expiryDate).getTime() - new Date().getTime();
    const days = Math.ceil(diffMs / (1000 * 3600 * 24));
    if (days < 0) return <span className="text-rose-600 font-bold">Expired</span>;
    return <span className="text-amber-600 font-semibold">{days} days left</span>;
  };

  return (
    <div id="quotation-printable-area" className="bg-white text-slate-900 border border-slate-200 rounded-xl p-8 shadow-sm space-y-6 max-w-3xl mx-auto font-sans">
      {/* Header Bar */}
      <div className="flex items-start justify-between border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
              QT
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">AVEX CRM</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Official Project Cost Estimate & Proposal
          </div>
        </div>

        <div className="text-right space-y-1">
          <div className="text-2xl font-black text-slate-900 tracking-tight">QUOTATION</div>
          <div className="text-sm font-mono font-bold text-emerald-600">
            {quotation.quoteNumber || 'QTN-DRAFT'}
          </div>
          <div className="flex items-center justify-end space-x-2 pt-0.5">
            {getStatusBadge(quotation.status)}
            {quotation.estimateType && (
              <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-600">
                {quotation.estimateType.replace('_', ' ')}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Info Metadata Grid */}
      <div className="grid grid-cols-2 gap-6 text-xs">
        {/* Prepared For Customer / Lead */}
        <div className="space-y-1.5 bg-slate-50 p-4 rounded-lg border border-slate-100">
          <div className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">PREPARED FOR</div>
          <div className="font-bold text-sm text-slate-900">
            {quotation.customer?.companyName || quotation.customer?.name || quotation.lead?.companyName || 'Client Name'}
          </div>
          {quotation.customer?.email && (
            <div className="text-slate-600">{quotation.customer.email}</div>
          )}
          {quotation.lead?.title && (
            <div className="text-slate-500 font-medium">Opportunity: {quotation.lead.title}</div>
          )}
        </div>

        {/* Quote Dates */}
        <div className="space-y-2 text-right">
          <div>
            <span className="text-slate-400 font-semibold mr-2">Quote Date:</span>
            <span className="font-bold text-slate-800 font-mono">
              {quotation.quoteDate ? new Date(quotation.quoteDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold mr-2">Valid Until:</span>
            <span className="font-bold text-slate-800 font-mono">
              {quotation.expiryDate ? new Date(quotation.expiryDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          {quotation.expiryDate && (
            <div className="flex items-center justify-end gap-1 text-[11px]">
              <Clock className="h-3 w-3 text-amber-500" />
              <span>Validity: {getExpiryDays()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Line Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
              <th className="py-2.5 px-3">Item & Description</th>
              <th className="py-2.5 px-3 text-right">Qty / Hrs</th>
              <th className="py-2.5 px-3 text-right">Unit Rate</th>
              <th className="py-2.5 px-3 text-right">Discount</th>
              <th className="py-2.5 px-3 text-right">Tax</th>
              <th className="py-2.5 px-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(quotation.items || []).map((item, idx) => (
              <tr key={item.id || idx}>
                <td className="py-3 px-3">
                  <div className="font-bold text-slate-900">{item.name || 'Line Item'}</div>
                  {item.description && (
                    <div className="text-[11px] text-slate-500">{item.description}</div>
                  )}
                </td>
                <td className="py-3 px-3 text-right font-medium text-slate-700">{item.quantity}</td>
                <td className="py-3 px-3 text-right font-mono text-slate-700">
                  ${Number(item.unitPrice || 0).toFixed(2)}
                </td>
                <td className="py-3 px-3 text-right text-slate-500">
                  {item.discountRate ? `${item.discountRate}%` : '-'}
                </td>
                <td className="py-3 px-3 text-right text-slate-500">
                  {item.taxRate ? `${item.taxRate}%` : '-'}
                </td>
                <td className="py-3 px-3 text-right font-bold font-mono text-slate-900">
                  ${Number(item.lineTotal || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Summary Breakdown */}
      <div className="flex justify-end pt-2">
        <div className="w-64 space-y-2 text-xs border-t border-slate-200 pt-3">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span className="font-mono font-bold">${Number(quotation.subtotal || 0).toFixed(2)}</span>
          </div>

          {(quotation.discountAmount || 0) > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Estimated Discount:</span>
              <span className="font-mono">-${Number(quotation.discountAmount || 0).toFixed(2)}</span>
            </div>
          )}

          {(quotation.taxAmount || 0) > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax:</span>
              <span className="font-mono">${Number(quotation.taxAmount || 0).toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-300 pt-2">
            <span>Estimated Total:</span>
            <span className="font-mono text-emerald-600">${Number(quotation.grandTotal || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      {(quotation.notes || quotation.termsConditions) && (
        <div className="border-t border-slate-200 pt-4 grid grid-cols-2 gap-4 text-[11px] text-slate-600">
          {quotation.notes && (
            <div>
              <div className="font-bold text-slate-700 mb-1">Proposal Notes:</div>
              <p className="whitespace-pre-line leading-relaxed">{quotation.notes}</p>
            </div>
          )}
          {quotation.termsConditions && (
            <div>
              <div className="font-bold text-slate-700 mb-1">Terms & Conditions:</div>
              <p className="whitespace-pre-line leading-relaxed">{quotation.termsConditions}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
