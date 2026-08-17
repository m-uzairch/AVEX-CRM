'use client';

import * as React from 'react';
import { KanbanColumn as KanbanColumnType } from '../../types/pipeline-types';
import { Lead, LeadStatus } from '../../types/lead-types';
import { KanbanColumn } from './kanban-column';

interface KanbanBoardProps {
  columns: KanbanColumnType[];
  onDropLead: (leadId: string, toStage: LeadStatus) => void;
  onCardClick: (lead: Lead) => void;
  onEditLead?: (lead: Lead) => void;
  onConvertLead?: (lead: Lead) => void;
  onArchiveLead?: (lead: Lead) => void;
  onDeleteLead?: (lead: Lead) => void;
}

export function KanbanBoard({
  columns,
  onDropLead,
  onCardClick,
  onEditLead,
  onConvertLead,
  onArchiveLead,
  onDeleteLead,
}: KanbanBoardProps) {
  return (
    <div className="flex items-start space-x-4 overflow-x-auto pb-6 pt-2 scrollbar-thin">
      {columns.map((column) => (
        <KanbanColumn
          key={column.id}
          column={column}
          onDropLead={onDropLead}
          onCardClick={onCardClick}
          onEditLead={onEditLead}
          onConvertLead={onConvertLead}
          onArchiveLead={onArchiveLead}
          onDeleteLead={onDeleteLead}
        />
      ))}
    </div>
  );
}
