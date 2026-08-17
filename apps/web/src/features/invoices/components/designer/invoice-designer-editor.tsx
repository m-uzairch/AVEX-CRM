/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { InvoiceTemplate, CompanyBranding, InvoiceLayoutStyle } from '../../types/invoice-template-types';
import { InvoicePreviewCard } from '../invoice-preview-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

interface InvoiceDesignerEditorProps {
  template: InvoiceTemplate;
  branding: CompanyBranding;
  onSaveSuccess: () => void;
  onCancel: () => void;
}

export function InvoiceDesignerEditor({
  template,
  branding: initialBranding,
  onSaveSuccess,
  onCancel,
}: InvoiceDesignerEditorProps) {
  const toastCtx = useToast();
  const [activeTab, setActiveTab] = React.useState<'LAYOUT' | 'BRANDING' | 'THEME' | 'COLUMNS' | 'FOOTER'>('LAYOUT');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Template Form State
  const [templateName, setTemplateName] = React.useState(template.name);
  const [layoutStyle, setLayoutStyle] = React.useState<InvoiceLayoutStyle>(template.layoutStyle);
  const [isDefault, setIsDefault] = React.useState(template.isDefault);
  const [primaryColor, setPrimaryColor] = React.useState(template.primaryColor || '#2563eb');
  const [fontFamily, setFontFamily] = React.useState(template.fontFamily || 'Inter');
  const [logoPosition, setLogoPosition] = React.useState(template.logoPosition || 'LEFT');
  const [showAddress, setShowAddress] = React.useState(template.showCompanyAddress ?? true);
  const [showPhone, setShowPhone] = React.useState(template.showPhone ?? true);
  const [showEmail, setShowEmail] = React.useState(template.showEmail ?? true);
  const [showTax, setShowTax] = React.useState(template.showTaxNumber ?? true);

  // Columns visibility state
  const [visibleColumns, setVisibleColumns] = React.useState<string[]>(
    template.visibleColumns || ['name', 'description', 'qty', 'price', 'discount', 'tax', 'total']
  );

  const [thankYouMessage, setThankYouMessage] = React.useState(template.thankYouMessage || '');
  const [footerText, setFooterText] = React.useState(template.footerText || '');
  const [defaultTerms, setDefaultTerms] = React.useState(template.defaultTerms || '');

  // Branding Form State
  const [branding, setBranding] = React.useState<CompanyBranding>(initialBranding);

  const toggleColumn = (colKey: string) => {
    setVisibleColumns((prev) =>
      prev.includes(colKey) ? prev.filter((c) => c !== colKey) : [...prev, colKey]
    );
  };

  // Preset Colors
  const colorPresets = ['#2563eb', '#7c3aed', '#059669', '#0f172a', '#e11d48', '#d97706', '#0284c7'];

  // Demo Invoice Data for Live Preview
  const demoInvoiceData = {
    invoiceNumber: 'INV-000104',
    invoiceDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
    status: 'SENT' as any,
    currency: 'USD',
    subtotal: 3500.0,
    discountAmount: 250.0,
    taxAmount: 162.5,
    grandTotal: 3412.5,
    amountPaid: 1000.0,
    remainingBalance: 2412.5,
    notes: 'Thank you for your business! Please remit payment by the due date.',
    customer: {
      id: 'cust_001',
      name: 'Sarah Connor',
      companyName: 'Acme Cybernetics Inc.',
      email: 'billing@acmecyber.com',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
    },
    project: {
      id: 'proj_001',
      projectCode: 'PRJ-2026-001',
      name: 'CRM Workspace Re-design',
    },
    items: [
      {
        id: 'item_1',
        name: 'UI/UX Design & Architecture',
        description: 'Complete dashboard re-skin with glassmorphic aesthetic & responsive layout',
        quantity: 1,
        unitPrice: 2000.0,
        discountRate: 5,
        taxRate: 5,
        lineTotal: 1995.0,
      },
      {
        id: 'item_2',
        name: 'Frontend Component Implementation',
        description: 'Next.js React typescript components with dark mode support',
        quantity: 1,
        unitPrice: 1500.0,
        discountRate: 10,
        taxRate: 5,
        lineTotal: 1417.5,
      },
    ],
  };

  const previewTemplateSettings: InvoiceTemplate = {
    ...template,
    name: templateName,
    layoutStyle,
    isDefault,
    primaryColor,
    fontFamily,
    logoPosition: logoPosition as any,
    showCompanyAddress: showAddress,
    showPhone,
    showEmail,
    showTaxNumber: showTax,
    visibleColumns,
    thankYouMessage,
    footerText,
    defaultTerms,
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // 1. Save branding
      await fetch('/api/invoices/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branding),
      });

      // 2. Save template
      const tplPayload = {
        name: templateName,
        layoutStyle,
        isDefault,
        primaryColor,
        fontFamily,
        logoPosition,
        headerAlignment: logoPosition,
        showCompanyAddress: showAddress,
        showPhone,
        showEmail,
        showTaxNumber: showTax,
        visibleColumns,
        thankYouMessage,
        footerText,
        defaultTerms,
      };

      const res = await fetch(`/api/invoices/templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tplPayload),
      });

      if (res.ok) {
        toastCtx.success('Template Saved', `Saved invoice template "${templateName}".`);
        onSaveSuccess();
      } else {
        toastCtx.error('Save Failed', 'Unable to save template settings.');
      }
    } catch (err) {
      console.error('Save template failed:', err);
      toastCtx.error('Save Error', 'Failed to save template.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4 shadow-2xs">
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={onCancel} className="h-8.5 text-xs gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Gallery</span>
          </Button>
          <h2 className="text-base font-bold text-foreground">
            Customizing Template: <span className="text-primary font-mono">{templateName}</span>
          </h2>
        </div>

        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSubmitting}
          className="h-8.5 text-xs gap-1.5 bg-primary text-primary-foreground font-bold hover:bg-primary/90"
        >
          {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          <span>Save Changes</span>
        </Button>
      </div>

      {/* Main Split Grid: Left Settings Form, Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customization Settings */}
        <div className="lg:col-span-6 space-y-4">
          {/* Setting Tabs Header */}
          <div className="flex border-b border-border bg-card rounded-t-xl px-2 overflow-x-auto text-xs font-semibold gap-1">
            <button
              onClick={() => setActiveTab('LAYOUT')}
              className={`py-3 px-3 border-b-2 transition-colors ${
                activeTab === 'LAYOUT' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground'
              }`}
            >
              Layout Style
            </button>

            <button
              onClick={() => setActiveTab('BRANDING')}
              className={`py-3 px-3 border-b-2 transition-colors ${
                activeTab === 'BRANDING' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground'
              }`}
            >
              Company Branding
            </button>

            <button
              onClick={() => setActiveTab('THEME')}
              className={`py-3 px-3 border-b-2 transition-colors ${
                activeTab === 'THEME' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground'
              }`}
            >
              Colors & Fonts
            </button>

            <button
              onClick={() => setActiveTab('COLUMNS')}
              className={`py-3 px-3 border-b-2 transition-colors ${
                activeTab === 'COLUMNS' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground'
              }`}
            >
              Columns & Toggles
            </button>

            <button
              onClick={() => setActiveTab('FOOTER')}
              className={`py-3 px-3 border-b-2 transition-colors ${
                activeTab === 'FOOTER' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground'
              }`}
            >
              Footer & Terms
            </button>
          </div>

          {/* Settings Body */}
          <div className="bg-card border border-border rounded-b-xl p-5 shadow-2xs space-y-4 text-xs">
            {/* Tab 1: Layout */}
            {activeTab === 'LAYOUT' && (
              <div className="space-y-4">
                <div>
                  <label className="font-semibold text-foreground block mb-1">Template Name *</label>
                  <Input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="h-8.5 text-xs bg-background font-semibold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1.5">Layout Style</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: 'CLASSIC', label: 'Classic Corporate', desc: 'Standard business layout with clean borders' },
                      { id: 'MODERN', label: 'Modern Gradient', desc: 'Bold colored header accent line' },
                      { id: 'MINIMAL', label: 'Minimal Clean', desc: 'Sleek compact layout for quick billing' },
                      { id: 'PROFESSIONAL', label: 'Executive Professional', desc: 'Formal executive header alignment' },
                    ].map((st) => (
                      <div
                        key={st.id}
                        onClick={() => setLayoutStyle(st.id as InvoiceLayoutStyle)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          layoutStyle === st.id
                            ? 'border-primary bg-primary/5 text-primary font-bold'
                            : 'border-border bg-background text-muted-foreground hover:border-primary/40'
                        }`}
                      >
                        <div className="text-xs font-bold text-foreground">{st.label}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{st.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="chk-default"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="chk-default" className="font-semibold text-foreground cursor-pointer">
                    Set as Default Template for Company Workspace
                  </label>
                </div>
              </div>
            )}

            {/* Tab 2: Company Branding */}
            {activeTab === 'BRANDING' && (
              <div className="space-y-4">
                <div>
                  <label className="font-semibold text-foreground block mb-1">Company Name</label>
                  <Input
                    value={branding.companyName || ''}
                    onChange={(e) => setBranding({ ...branding, companyName: e.target.value })}
                    className="h-8.5 text-xs bg-background"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">Company Logo Image URL</label>
                  <Input
                    placeholder="https://yourdomain.com/logo.png"
                    value={branding.logoUrl || ''}
                    onChange={(e) => setBranding({ ...branding, logoUrl: e.target.value })}
                    className="h-8.5 text-xs bg-background font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-foreground block mb-1">Address</label>
                    <Input
                      value={branding.address || ''}
                      onChange={(e) => setBranding({ ...branding, address: e.target.value })}
                      className="h-8.5 text-xs bg-background"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-foreground block mb-1">City / State</label>
                    <Input
                      value={branding.city || ''}
                      onChange={(e) => setBranding({ ...branding, city: e.target.value })}
                      className="h-8.5 text-xs bg-background"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-foreground block mb-1">Phone Number</label>
                    <Input
                      value={branding.phone || ''}
                      onChange={(e) => setBranding({ ...branding, phone: e.target.value })}
                      className="h-8.5 text-xs bg-background"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-foreground block mb-1">Billing Email</label>
                    <Input
                      value={branding.email || ''}
                      onChange={(e) => setBranding({ ...branding, email: e.target.value })}
                      className="h-8.5 text-xs bg-background"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-foreground block mb-1">Tax Registration #</label>
                    <Input
                      value={branding.taxNumber || ''}
                      onChange={(e) => setBranding({ ...branding, taxNumber: e.target.value })}
                      className="h-8.5 text-xs bg-background font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-foreground block mb-1">Website URL</label>
                    <Input
                      value={branding.website || ''}
                      onChange={(e) => setBranding({ ...branding, website: e.target.value })}
                      className="h-8.5 text-xs bg-background"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Colors & Fonts */}
            {activeTab === 'THEME' && (
              <div className="space-y-4">
                <div>
                  <label className="font-semibold text-foreground block mb-1.5">Primary Accent Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-9 w-12 rounded cursor-pointer border border-border"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-8.5 text-xs bg-background font-mono w-28"
                    />

                    <div className="flex items-center space-x-1.5">
                      {colorPresets.map((hex) => (
                        <div
                          key={hex}
                          onClick={() => setPrimaryColor(hex)}
                          className="h-6 w-6 rounded-full cursor-pointer border border-white shadow-xs hover:scale-110 transition-transform"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-foreground block mb-1">Font Family</label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="flex h-8.5 w-full rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="Inter">Inter (Modern Clean)</option>
                      <option value="Roboto">Roboto (Corporate Standard)</option>
                      <option value="Outfit">Outfit (Contemporary)</option>
                      <option value="Courier">Courier (Monospace Technical)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-foreground block mb-1">Logo Alignment</label>
                    <select
                      value={logoPosition}
                      onChange={(e) => setLogoPosition(e.target.value as any)}
                      className="flex h-8.5 w-full rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="LEFT">Left Aligned</option>
                      <option value="CENTER">Center Aligned</option>
                      <option value="RIGHT">Right Aligned</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Columns & Toggles */}
            {activeTab === 'COLUMNS' && (
              <div className="space-y-4">
                <div>
                  <div className="font-bold text-foreground mb-1">Company Contact Info Toggles</div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={showAddress}
                        onChange={(e) => setShowAddress(e.target.checked)}
                        className="rounded border-border text-primary"
                      />
                      <span>Show Address</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={showPhone}
                        onChange={(e) => setShowPhone(e.target.checked)}
                        className="rounded border-border text-primary"
                      />
                      <span>Show Phone</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={showEmail}
                        onChange={(e) => setShowEmail(e.target.checked)}
                        className="rounded border-border text-primary"
                      />
                      <span>Show Email</span>
                    </label>

                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={showTax}
                        onChange={(e) => setShowTax(e.target.checked)}
                        className="rounded border-border text-primary"
                      />
                      <span>Show Tax ID</span>
                    </label>
                  </div>
                </div>

                <div className="border-t border-border pt-3">
                  <div className="font-bold text-foreground mb-1">Invoice Item Table Columns</div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {[
                      { key: 'description', label: 'Item Description' },
                      { key: 'qty', label: 'Quantity' },
                      { key: 'price', label: 'Unit Price' },
                      { key: 'discount', label: 'Line Discount %' },
                      { key: 'tax', label: 'Tax Rate %' },
                      { key: 'total', label: 'Line Total' },
                    ].map((col) => (
                      <label key={col.key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={visibleColumns.includes(col.key)}
                          onChange={() => toggleColumn(col.key)}
                          className="rounded border-border text-primary"
                        />
                        <span>{col.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Footer & Terms */}
            {activeTab === 'FOOTER' && (
              <div className="space-y-4">
                <div>
                  <label className="font-semibold text-foreground block mb-1">Thank You Message</label>
                  <Input
                    placeholder="e.g. Thank you for choosing our services!"
                    value={thankYouMessage}
                    onChange={(e) => setThankYouMessage(e.target.value)}
                    className="h-8.5 text-xs bg-background"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">Footer Subtext Notice</label>
                  <Input
                    placeholder="e.g. Generated automatically by AVEX CRM"
                    value={footerText}
                    onChange={(e) => setFooterText(e.target.value)}
                    className="h-8.5 text-xs bg-background text-muted-foreground"
                  />
                </div>

                <div>
                  <label className="font-semibold text-foreground block mb-1">Default Terms & Conditions</label>
                  <Textarea
                    rows={4}
                    placeholder="Enter default terms & conditions to automatically apply on new invoices..."
                    value={defaultTerms}
                    onChange={(e) => setDefaultTerms(e.target.value)}
                    className="text-xs bg-background"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Invoice Preview */}
        <div className="lg:col-span-6 sticky top-6 space-y-2">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
            Real-Time Template Live Preview
          </div>
          <InvoicePreviewCard
            invoice={demoInvoiceData}
            template={previewTemplateSettings}
            branding={branding}
          />
        </div>
      </div>
    </div>
  );
}
