'use client';

import * as React from 'react';
import { TaxTemplate } from '../types/tax-types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Star, Check, Sparkles, Layers } from 'lucide-react';

interface TaxTemplateManagerProps {
  templates: TaxTemplate[];
  loading: boolean;
  onOpenCreateModal: () => void;
  onSetDefault: (templateId: string) => Promise<void>;
}

export function TaxTemplateManager({
  templates,
  loading,
  onOpenCreateModal,
  onSetDefault,
}: TaxTemplateManagerProps) {
  const [settingDefaultId, setSettingDefaultId] = React.useState<string | null>(null);

  const handleSetDefault = async (id: string) => {
    setSettingDefaultId(id);
    try {
      await onSetDefault(id);
    } finally {
      setSettingDefaultId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600" /> Reusable Tax Templates
          </h3>
          <p className="text-sm text-slate-500">
            Configure default multi-rate tax packages for different countries (Pakistan, UAE, UK, USA) and assign a default template for automatic invoice/quotation calculations.
          </p>
        </div>

        <Button onClick={onOpenCreateModal}>
          <Plus className="h-4 w-4 mr-2" /> Create Template
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading tax templates...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-slate-500">No tax templates found. Create your first tax template above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tmpl) => (
            <Card
              key={tmpl.id}
              className={`relative transition-all duration-200 ${
                tmpl.isDefault
                  ? 'border-2 border-blue-500 shadow-md bg-blue-50/20 dark:bg-blue-950/20'
                  : 'hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {tmpl.isDefault && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-blue-600 text-white gap-1 flex items-center px-2 py-0.5 text-xs font-semibold">
                    <Star className="h-3 w-3 fill-current" /> Company Default
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100 pr-24">
                  {tmpl.name}
                </CardTitle>
                <CardDescription className="text-xs line-clamp-2">
                  {tmpl.description || 'No description provided.'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                    Calculation Method
                  </span>
                  <Badge variant="outline" className="text-xs font-medium">
                    {tmpl.calculationMethod}
                  </Badge>
                </div>

                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">
                    Included Taxes ({tmpl.taxes?.length || 0})
                  </span>
                  {tmpl.taxes && tmpl.taxes.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {tmpl.taxes.map((t) => (
                        <span
                          key={t.id}
                          className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                          <Sparkles className="h-3 w-3 mr-1 text-blue-500" />
                          {t.name} ({t.percentage}%)
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No tax rates linked</span>
                  )}
                </div>
              </CardContent>

              <CardFooter className="pt-2 border-t border-slate-100 dark:border-slate-800">
                {tmpl.isDefault ? (
                  <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center">
                    <Check className="h-4 w-4 mr-1" /> Active Default Template
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    disabled={settingDefaultId === tmpl.id}
                    onClick={() => handleSetDefault(tmpl.id)}
                  >
                    {settingDefaultId === tmpl.id ? 'Setting Default...' : 'Set as Default Template'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
