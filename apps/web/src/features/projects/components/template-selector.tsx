'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ProjectTemplate } from '../types/project-types';
import { PREDEFINED_TEMPLATES } from '../services/project-automation-service';
import { Check, Sparkles, Layout, Database, Smartphone, Palette, Megaphone, Code } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplateId?: string | null;
  onSelectTemplate: (template: ProjectTemplate | null) => void;
}

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  tmpl_website: <Layout className="h-5 w-5 text-blue-500" />,
  tmpl_crm: <Database className="h-5 w-5 text-pink-500" />,
  tmpl_mobile: <Smartphone className="h-5 w-5 text-purple-500" />,
  tmpl_branding: <Palette className="h-5 w-5 text-amber-500" />,
  tmpl_marketing: <Megaphone className="h-5 w-5 text-indigo-500" />,
  tmpl_custom_software: <Code className="h-5 w-5 text-cyan-500" />,
};

export function TemplateSelector({ selectedTemplateId, onSelectTemplate }: TemplateSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" />
          Predefined Project Templates (Optional)
        </label>
        {selectedTemplateId && (
          <button
            type="button"
            onClick={() => onSelectTemplate(null)}
            className="text-xs text-primary font-medium hover:underline"
          >
            Clear Selected Template
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {PREDEFINED_TEMPLATES.map((tmpl) => {
          const isSelected = selectedTemplateId === tmpl.id;
          const Icon = TEMPLATE_ICONS[tmpl.id] || <Sparkles className="h-5 w-5 text-primary" />;

          return (
            <Card
              key={tmpl.id}
              onClick={() => onSelectTemplate(isSelected ? null : tmpl)}
              className={`cursor-pointer transition-all duration-200 border relative ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border hover:border-primary/40 bg-card'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="h-3 w-3" />
                </div>
              )}
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-md bg-muted shrink-0">{Icon}</div>
                  <div className="truncate">
                    <h4 className="font-bold text-xs text-foreground truncate">{tmpl.name}</h4>
                    <span className="text-[10px] text-muted-foreground font-medium">{tmpl.categoryName}</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {tmpl.description}
                </p>
                <div className="pt-1 text-[10px] font-semibold text-primary">
                  {tmpl.defaultMilestones.length} default milestones included
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
