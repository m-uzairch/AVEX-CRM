'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BusinessTypeOption } from '../types/project-types';
import { BUSINESS_TYPE_SUGGESTIONS } from '../services/project-automation-service';
import { Building2, Laptop, Check } from 'lucide-react';

interface BusinessTypeSelectorProps {
  value?: BusinessTypeOption;
  onChange: (type: BusinessTypeOption) => void;
}

export function BusinessTypeSelector({ value, onChange }: BusinessTypeSelectorProps) {
  const types: { id: BusinessTypeOption; icon: React.ReactNode }[] = [
    {
      id: 'DIGITAL',
      icon: <Laptop className="h-6 w-6 text-indigo-500" />,
    },
    {
      id: 'PHYSICAL',
      icon: <Building2 className="h-6 w-6 text-emerald-500" />,
    },
  ];

  return (
    <div className="space-y-3">
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
        What type of business is this project for?
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {types.map((item) => {
          const info = BUSINESS_TYPE_SUGGESTIONS[item.id];
          const isSelected = value === item.id;

          return (
            <Card
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`cursor-pointer transition-all duration-200 border-2 relative ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border hover:border-primary/40 bg-card'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="h-3.5 w-3.5" />
                </div>
              )}
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-lg bg-muted border border-border">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{info.label}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{info.description}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase block mb-1.5">
                    Suggested Categories
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {info.categories.slice(0, 4).map((cat) => (
                      <span
                        key={cat}
                        className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium"
                      >
                        {cat}
                      </span>
                    ))}
                    {info.categories.length > 4 && (
                      <span className="text-[10px] px-1.5 py-0.5 text-muted-foreground font-medium">
                        +{info.categories.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
