/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { Invoice } from '../types/invoice-types';
import { InvoiceTemplate, CompanyBranding } from '../types/invoice-template-types';
import { Badge } from '@/components/ui/badge';

interface InvoicePreviewCardProps {
  invoice: Partial<Omit<Invoice, 'items'>> & { items?: any[] };
  template?: Partial<InvoiceTemplate>;
  branding?: Partial<CompanyBranding>;
}

export function InvoicePreviewCard({ invoice, template, branding }: InvoicePreviewCardProps) {
  const primaryColor = template?.primaryColor || '#2563eb';
  const secondaryColor = template?.secondaryColor || '#64748b';
  const fontFamily = template?.fontFamily || 'Inter';
  const layoutStyle = template?.layoutStyle || 'CLASSIC';

  const showAddress = template?.showCompanyAddress ?? true;
  const showPhone = template?.showPhone ?? true;
  const showEmail = template?.showEmail ?? true;
  const showWebsite = template?.showWebsite ?? true;
  const showTax = template?.showTaxNumber ?? true;

  const visibleCols = template?.visibleColumns || ['name', 'description', 'qty', 'price', 'discount', 'tax', 'total'];

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold text-xs">PAID</Badge>;
      case 'PARTIALLY_PAID':
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 font-bold text-xs">PARTIALLY PAID</Badge>;
      case 'OVERDUE':
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 font-bold text-xs">OVERDUE</Badge>;
      case 'SENT':
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 font-bold text-xs">SENT</Badge>;
      case 'VIEWED':
        return <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 font-bold text-xs">VIEWED</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-slate-500/10 text-slate-600 border-slate-500/20 font-bold text-xs">CANCELLED</Badge>;
      default:
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold text-xs">DRAFT</Badge>;
    }
  };

  const getFontFamilyStyle = () => {
    switch (fontFamily) {
      case 'Roboto':
        return 'font-sans';
      case 'Outfit':
        return 'font-sans tracking-wide';
      case 'Courier':
        return 'font-mono';
      default:
        return 'font-sans';
    }
  };

  return (
    <div
      id="invoice-printable-area"
      className={`bg-white text-slate-900 border border-slate-200 rounded-xl p-8 shadow-sm space-y-6 max-w-3xl mx-auto ${getFontFamilyStyle()}`}
      style={{ fontFamily: fontFamily === 'Courier' ? 'monospace' : fontFamily }}
    >
      {/* Header Bar */}
      <div
        className={`flex items-start justify-between border-b pb-6 ${
          layoutStyle === 'MODERN' ? 'border-b-2' : 'border-slate-200'
        }`}
        style={{ borderColor: layoutStyle === 'MODERN' ? primaryColor : undefined }}
      >
        {/* Logo & Company Info */}
        <div className={`space-y-1 ${template?.logoPosition === 'CENTER' ? 'text-center flex-1' : ''}`}>
          <div className={`flex items-center space-x-2 ${template?.logoPosition === 'CENTER' ? 'justify-center' : ''}`}>
            {branding?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={branding.logoUrl} alt="Logo" className="h-8 max-w-[120px] object-contain" />
            ) : (
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center text-white font-black text-sm"
                style={{ backgroundColor: primaryColor }}
              >
                AX
              </div>
            )}
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              {branding?.companyName || 'AVEX CRM'}
            </span>
          </div>

          <div className="text-xs text-slate-500 pt-0.5 space-y-0.5">
            {showAddress && branding?.address && (
              <div>{branding.address}, {branding.city} {branding.state} {branding.zip}</div>
            )}
            <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
              {showPhone && branding?.phone && <span>Tel: {branding.phone}</span>}
              {showEmail && branding?.email && <span>Email: {branding.email}</span>}
              {showWebsite && branding?.website && <span>{branding.website}</span>}
              {showTax && branding?.taxNumber && <span>Tax ID: {branding.taxNumber}</span>}
            </div>
          </div>
        </div>

        {/* Invoice Metadata Header */}
        <div className="text-right space-y-1">
          <div className="text-2xl font-black tracking-tight" style={{ color: primaryColor }}>
            INVOICE
          </div>
          <div className="text-sm font-mono font-bold text-slate-700">
            {invoice.invoiceNumber || 'INV-DRAFT'}
          </div>
          <div>{getStatusBadge(invoice.status)}</div>
        </div>
      </div>

      {/* Info Metadata Grid */}
      <div className="grid grid-cols-2 gap-6 text-xs">
        {/* Bill To Customer */}
        <div
          className="space-y-1.5 p-4 rounded-lg border"
          style={{
            backgroundColor: layoutStyle === 'MINIMAL' ? '#ffffff' : '#f8fafc',
            borderColor: layoutStyle === 'MODERN' ? `${primaryColor}30` : '#f1f5f9',
          }}
        >
          <div className="font-bold uppercase tracking-wider text-[10px]" style={{ color: secondaryColor }}>
            BILLED TO
          </div>
          <div className="font-bold text-sm text-slate-900">
            {invoice.customer?.companyName || invoice.customer?.name || 'Customer Name'}
          </div>
          {invoice.customer?.email && (
            <div className="text-slate-600">{invoice.customer.email}</div>
          )}
          {invoice.customer?.address && (
            <div className="text-slate-500">
              {invoice.customer.address}, {invoice.customer.city}
            </div>
          )}
        </div>

        {/* Dates & Project Info */}
        <div className="space-y-2 text-right">
          <div>
            <span className="font-semibold mr-2" style={{ color: secondaryColor }}>Invoice Date:</span>
            <span className="font-bold text-slate-800 font-mono">
              {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div>
            <span className="font-semibold mr-2" style={{ color: secondaryColor }}>Due Date:</span>
            <span className="font-bold text-slate-800 font-mono">
              {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          {invoice.project && (
            <div>
              <span className="font-semibold mr-2" style={{ color: secondaryColor }}>Project:</span>
              <span className="font-bold" style={{ color: primaryColor }}>{invoice.project.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Line Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr
              className="font-bold border-b"
              style={{
                backgroundColor: layoutStyle === 'MODERN' ? `${primaryColor}15` : '#f1f5f9',
                color: layoutStyle === 'MODERN' ? primaryColor : '#475569',
                borderColor: '#e2e8f0',
              }}
            >
              <th className="py-2.5 px-3">Item & Description</th>
              {visibleCols.includes('qty') && <th className="py-2.5 px-3 text-right">Qty</th>}
              {visibleCols.includes('price') && <th className="py-2.5 px-3 text-right">Unit Price</th>}
              {visibleCols.includes('discount') && <th className="py-2.5 px-3 text-right">Discount</th>}
              {visibleCols.includes('tax') && <th className="py-2.5 px-3 text-right">Tax</th>}
              {visibleCols.includes('total') && <th className="py-2.5 px-3 text-right">Total</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(invoice.items || []).map((item, idx) => (
              <tr key={item.id || idx}>
                <td className="py-3 px-3">
                  <div className="font-bold text-slate-900">{item.name || 'Line Item'}</div>
                  {visibleCols.includes('description') && item.description && (
                    <div className="text-[11px] text-slate-500">{item.description}</div>
                  )}
                </td>
                {visibleCols.includes('qty') && (
                  <td className="py-3 px-3 text-right font-medium text-slate-700">{item.quantity}</td>
                )}
                {visibleCols.includes('price') && (
                  <td className="py-3 px-3 text-right font-mono text-slate-700">
                    ${Number(item.unitPrice || 0).toFixed(2)}
                  </td>
                )}
                {visibleCols.includes('discount') && (
                  <td className="py-3 px-3 text-right text-slate-500">
                    {item.discountRate ? `${item.discountRate}%` : '-'}
                  </td>
                )}
                {visibleCols.includes('tax') && (
                  <td className="py-3 px-3 text-right text-slate-500">
                    {item.taxRate ? `${item.taxRate}%` : '-'}
                  </td>
                )}
                {visibleCols.includes('total') && (
                  <td className="py-3 px-3 text-right font-bold font-mono text-slate-900">
                    ${Number(item.lineTotal || 0).toFixed(2)}
                  </td>
                )}
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
            <span className="font-mono font-bold">${Number(invoice.subtotal || 0).toFixed(2)}</span>
          </div>

          {(invoice.discountAmount || 0) > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Total Discount:</span>
              <span className="font-mono">-${Number(invoice.discountAmount || 0).toFixed(2)}</span>
            </div>
          )}

          {(invoice.taxAmount || 0) > 0 && (
            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax:</span>
              <span className="font-mono">${Number(invoice.taxAmount || 0).toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-extrabold text-slate-900 border-t border-slate-300 pt-2">
            <span>Grand Total:</span>
            <span className="font-mono" style={{ color: primaryColor }}>
              ${Number(invoice.grandTotal || 0).toFixed(2)}
            </span>
          </div>

          {(invoice.amountPaid || 0) > 0 && (
            <div className="flex justify-between text-emerald-600 font-bold pt-1">
              <span>Amount Paid:</span>
              <span className="font-mono">-${Number(invoice.amountPaid || 0).toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-sm font-bold text-slate-900 bg-slate-100 p-2 rounded-md mt-1">
            <span>Balance Due:</span>
            <span className="font-mono text-slate-900">
              ${Number(invoice.remainingBalance ?? invoice.grandTotal ?? 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Notes & Terms */}
      {(invoice.notes || invoice.termsConditions || template?.defaultTerms || template?.thankYouMessage) && (
        <div className="border-t border-slate-200 pt-4 grid grid-cols-2 gap-4 text-[11px] text-slate-600">
          <div>
            {invoice.notes && (
              <>
                <div className="font-bold text-slate-700 mb-1">Notes:</div>
                <p className="whitespace-pre-line leading-relaxed mb-2">{invoice.notes}</p>
              </>
            )}
            {template?.thankYouMessage && (
              <div className="font-bold italic" style={{ color: primaryColor }}>
                {template.thankYouMessage}
              </div>
            )}
          </div>

          <div>
            {(invoice.termsConditions || template?.defaultTerms) && (
              <>
                <div className="font-bold text-slate-700 mb-1">Terms & Conditions:</div>
                <p className="whitespace-pre-line leading-relaxed">
                  {invoice.termsConditions || template?.defaultTerms}
                </p>
              </>
            )}
            {template?.footerText && (
              <div className="text-[10px] text-slate-400 mt-2 font-medium">
                {template.footerText}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
