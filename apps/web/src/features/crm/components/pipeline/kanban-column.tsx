'use client';

import * as React from 'react';
import { DollarSign, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { KanbanColumn as KanbanColumnType } from '../../types/pipeline-types';
import { Lead, LeadStatus } from '../../types/lead-types';
import { KanbanCard } from './kanban-card';

interface KanbanColumnProps {
  column: KanbanColumnType;
  onDropLead: (leadId: string, toStage: LeadStatus) => void;
  onCardClick: (lead: Lead) => void;
  onEditLead?: (lead: Lead) => void;
  onConvertLead?: (lead: Lead) => void;
  onArchiveLead?: (lead: Lead) => void;
  onDeleteLead?: (lead: Lead) => void;
}

export function KanbanColumn({
  column,
  onDropLead,
  onCardClick,
  onEditLead,
  onConvertLead,
  onArchiveLead,
  onDeleteLead,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const leadId = e.dataTransfer.getData('text/plain');
    if (leadId) {
      onDropLead(leadId, column.id);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col space-y-3 min-w-[280px] max-w-[320px] rounded-xl p-2.5 transition-colors ${
        isDragOver
          ? 'bg-primary/10 border-2 border-dashed border-primary'
          : 'bg-muted/30 border border-border/60'
      }`}
    >
      {/* Column Header */}
      <div className={`p-3 rounded-lg border ${column.color} space-y-1.5 shadow-xs`}>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-foreground flex items-center space-x-1.5">
            <span>{column.name}</span>
          </h3>
          <Badge className={`${column.badgeBg} border-none font-bold text-[10px]`}>
            {column.leadCount}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
          <span>Expected Revenue:</span>
          <span className="font-extrabold text-foreground flex items-center">
            <DollarSign className="h-3 w-3 text-emerald-500" />
            {column.totalValue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
        {column.leads.length === 0 ? (
          <div className="h-32 border border-dashed border-border/80 rounded-xl flex flex-col items-center justify-center text-muted-foreground text-xs space-y-1">
            <Layers className="h-5 w-5 opacity-40" />
            <span className="text-[11px]">No leads in {column.name}</span>
            <span className="text-[10px] text-muted-foreground/70">Drag a lead card here</span>
          </div>
        ) : (
          column.leads.map((lead) => (
            <KanbanCard
              key={lead.id}
              lead={lead}
              onCardClick={onCardClick}
              onEditLead={onEditLead}
              onConvertLead={onConvertLead}
              onArchiveLead={onArchiveLead}
              onDeleteLead={onDeleteLead}
            />
          ))
        )}
      </div>
    </div>
  );
}
