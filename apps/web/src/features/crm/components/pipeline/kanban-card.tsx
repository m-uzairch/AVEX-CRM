'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  Building,
  DollarSign,
  UserCheck,
  Edit,
  Archive,
  Trash2,
  ExternalLink,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Lead, LeadPriority, LeadStatus } from '../../types/lead-types';
import { LeadScoreBadge } from '../leads/lead-score-badge';

interface KanbanCardProps {
  lead: Lead;
  onCardClick: (lead: Lead) => void;
  onMoveStage?: (leadId: string, toStage: LeadStatus) => void;
  onEditLead?: (lead: Lead) => void;
  onConvertLead?: (lead: Lead) => void;
  onArchiveLead?: (lead: Lead) => void;
  onDeleteLead?: (lead: Lead) => void;
}

export function KanbanCard({
  lead,
  onCardClick,
  onMoveStage: _onMoveStage,
  onEditLead,
  onConvertLead,
  onArchiveLead,
  onDeleteLead,
}: KanbanCardProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', lead.id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const getPriorityBadge = (priority: LeadPriority) => {
    switch (priority) {
      case 'URGENT':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-red-600 border border-red-500/20">URGENT</span>;
      case 'HIGH':
        return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-600 border border-orange-500/20">HIGH</span>;
      case 'MEDIUM':
        return <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 border border-blue-500/20">MED</span>;
      case 'LOW':
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">LOW</span>;
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onCardClick(lead)}
      className={`bg-card border border-border/80 rounded-xl p-3.5 shadow-xs hover:shadow-md hover:border-primary/40 transition-all cursor-grab active:cursor-grabbing select-none group relative space-y-2.5 ${
        isDragging ? 'opacity-40 scale-95 border-primary border-dashed' : ''
      }`}
    >
      {/* Header: Lead Name & Menu */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 min-w-0 flex-1">
          <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors truncate">
            {lead.name}
          </h4>
          <div className="flex items-center space-x-1 text-[11px] text-muted-foreground truncate">
            <Building className="h-3 w-3 shrink-0" />
            <span className="truncate">{lead.companyName}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {getPriorityBadge(lead.priority)}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>

          {/* Card Quick Actions Menu */}
          {isMenuOpen && (
            <div className="absolute right-2 top-8 z-50 bg-popover border border-border rounded-lg shadow-xl w-44 py-1 text-left text-xs animate-in fade-in">
              <button
                type="button"
                className="w-full text-left flex items-center space-x-2 px-3 py-1.5 hover:bg-muted text-popover-foreground"
                onClick={() => {
                  setIsMenuOpen(false);
                  onCardClick(lead);
                }}
              >
                <ExternalLink className="h-3.5 w-3.5 text-primary" />
                <span>Open Drawer Details</span>
              </button>

              {onEditLead && (
                <button
                  type="button"
                  className="w-full text-left flex items-center space-x-2 px-3 py-1.5 hover:bg-muted text-popover-foreground"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onEditLead(lead);
                  }}
                >
                  <Edit className="h-3.5 w-3.5 text-blue-500" />
                  <span>Edit Details</span>
                </button>
              )}

              {!lead.isConverted && onConvertLead && (
                <button
                  type="button"
                  className="w-full text-left flex items-center space-x-2 px-3 py-1.5 hover:bg-muted text-emerald-600 font-semibold"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onConvertLead(lead);
                  }}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Convert to Customer</span>
                </button>
              )}

              {onArchiveLead && (
                <button
                  type="button"
                  className="w-full text-left flex items-center space-x-2 px-3 py-1.5 hover:bg-muted text-popover-foreground"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onArchiveLead(lead);
                  }}
                >
                  <Archive className="h-3.5 w-3.5 text-amber-500" />
                  <span>Archive Card</span>
                </button>
              )}

              {onDeleteLead && (
                <button
                  type="button"
                  className="w-full text-left flex items-center space-x-2 px-3 py-1.5 hover:bg-muted text-destructive font-semibold"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onDeleteLead(lead);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Soft Delete</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Middle row: Deal Value & Win Probability */}
      <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
        <div className="flex items-center font-extrabold text-emerald-600 dark:text-emerald-400">
          <DollarSign className="h-3.5 w-3.5 mr-0.5 shrink-0" />
          <span>{(lead.expectedDealValue || 0).toLocaleString()}</span>
        </div>

        <div className="flex items-center space-x-1 text-[11px] text-muted-foreground font-semibold">
          <Target className="h-3 w-3 text-indigo-500 shrink-0" />
          <span>{lead.winProbability ?? 50}% Win</span>
        </div>
      </div>

      {/* Tags row */}
      {lead.tags && lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {lead.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[9px] px-1.5 py-0.2 rounded bg-muted/80 text-muted-foreground font-medium truncate max-w-[90px]"
            >
              {tag}
            </span>
          ))}
          {lead.tags.length > 2 && (
            <span className="text-[9px] px-1 py-0.2 rounded bg-muted text-muted-foreground font-bold">
              +{lead.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Footer: Employee Avatar & Lead Score */}
      <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
        {lead.assignedEmployee ? (
          <div className="flex items-center space-x-1.5 truncate max-w-[120px]">
            <div className="h-5 w-5 rounded-full bg-primary/10 text-primary font-bold text-[9px] flex items-center justify-center shrink-0">
              {lead.assignedEmployee.fullName.substring(0, 2).toUpperCase()}
            </div>
            <span className="text-muted-foreground truncate">{lead.assignedEmployee.fullName}</span>
          </div>
        ) : (
          <span className="text-muted-foreground italic text-[10px]">Unassigned</span>
        )}

        <LeadScoreBadge score={lead.score} size="sm" showLabel={false} />
      </div>
    </div>
  );
}
