/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { InvoiceTemplate } from '../../types/invoice-template-types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Copy, Edit, Trash2, Star, Plus } from 'lucide-react';
import { useToast } from '@/providers/toast-provider';

interface InvoiceTemplateGalleryProps {
  templates: InvoiceTemplate[];
  onSelectTemplate: (template: InvoiceTemplate) => void;
  onRefresh: () => void;
  onCreateNew: () => void;
}

export function InvoiceTemplateGallery({
  templates,
  onSelectTemplate,
  onRefresh,
  onCreateNew,
}: InvoiceTemplateGalleryProps) {
  const toastCtx = useToast();
  const [loadingId, setLoadingId] = React.useState<string | null>(null);

  const handleSetDefault = async (id: string, name: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/invoices/templates/${id}/default`, { method: 'POST' });
      if (res.ok) {
        toastCtx.success('Default Template Set', `"${name}" is now the active default invoice template.`);
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to set default template:', err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDuplicate = async (id: string, name: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/invoices/templates/${id}/duplicate`, { method: 'POST' });
      if (res.ok) {
        toastCtx.success('Template Duplicated', `Created duplicate of "${name}".`);
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to duplicate template:', err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete template "${name}"?`)) return;
    setLoadingId(id);
    try {
      const res = await fetch(`/api/invoices/templates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toastCtx.success('Template Deleted', `Template "${name}" deleted successfully.`);
        onRefresh();
      } else {
        const errData = await res.json();
        toastCtx.error('Delete Error', errData.error || 'Failed to delete template.');
      }
    } catch (err) {
      console.error('Failed to delete template:', err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-foreground">Invoice Template Repository</h3>
          <p className="text-xs text-muted-foreground">Select a template layout to customize or set as company default.</p>
        </div>

        <Button size="sm" onClick={onCreateNew} className="h-8 px-3 text-xs gap-1.5 bg-primary text-primary-foreground font-bold">
          <Plus className="h-3.5 w-3.5" />
          <span>New Custom Template</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {templates.map((tpl) => (
          <Card
            key={tpl.id}
            className={`shadow-2xs transition-all relative overflow-hidden flex flex-col justify-between border-2 ${
              tpl.isDefault ? 'border-primary/60 bg-primary/5' : 'border-border/80 hover:border-primary/40'
            }`}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <div
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: tpl.primaryColor || '#2563eb' }}
                  />
                  <CardTitle className="text-sm font-bold truncate">{tpl.name}</CardTitle>
                </div>
                {tpl.isDefault && (
                  <Badge className="bg-primary text-primary-foreground text-[9px] font-extrabold gap-0.5 px-1.5">
                    <Star className="h-2.5 w-2.5 fill-current" /> DEFAULT
                  </Badge>
                )}
              </div>
              <CardDescription className="text-[11px] font-mono capitalize text-muted-foreground pt-0.5">
                {tpl.layoutStyle.toLowerCase()} layout • {tpl.fontFamily}
              </CardDescription>
            </CardHeader>

            {/* Thumbnail Mockup Box */}
            <CardContent className="p-4 py-2">
              <div
                onClick={() => onSelectTemplate(tpl)}
                className="bg-white border border-slate-200 rounded-lg p-3 space-y-2 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <div className="h-2.5 w-12 rounded bg-slate-300" style={{ backgroundColor: tpl.primaryColor }} />
                  <div className="h-2 w-8 rounded bg-slate-200" />
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 w-full rounded bg-slate-100" />
                  <div className="h-1.5 w-3/4 rounded bg-slate-100" />
                  <div className="h-1.5 w-1/2 rounded bg-slate-100" />
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-3 bg-muted/20 border-t border-border/60 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectTemplate(tpl)}
                className="h-7 text-xs font-semibold text-primary gap-1"
              >
                <Edit className="h-3 w-3" />
                <span>Customize</span>
              </Button>

              <div className="flex items-center space-x-1">
                {!tpl.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetDefault(tpl.id, tpl.name)}
                    disabled={loadingId === tpl.id}
                    className="h-7 text-[11px] text-muted-foreground hover:text-foreground"
                    title="Set as Default"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDuplicate(tpl.id, tpl.name)}
                  disabled={loadingId === tpl.id}
                  className="h-7 text-[11px] text-muted-foreground hover:text-foreground"
                  title="Duplicate"
                >
                  <Copy className="h-3 w-3" />
                </Button>

                {!tpl.isBuiltIn && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(tpl.id, tpl.name)}
                    disabled={loadingId === tpl.id}
                    className="h-7 text-[11px] text-rose-500 hover:text-rose-700"
                    title="Delete Custom Template"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
