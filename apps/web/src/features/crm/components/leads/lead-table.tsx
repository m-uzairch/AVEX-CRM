'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  MoreHorizontal,
  Mail,
  Phone,
  Building,
  ArrowUpDown,
  UserCheck,
  Archive,
  Trash2,
  Edit,
  ExternalLink,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lead, LeadStatus, LeadPriority } from '../../types/lead-types';
import { LeadScoreBadge } from './lead-score-badge';

interface LeadTableProps {
  leads: Lead[];
  isLoading?: boolean;
  selectedIds: string[];
  onSelectToggle: (id: string) => void;
  onSelectAllToggle: () => void;
  onSortChange: (field: string) => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onEditLead: (lead: Lead) => void;
  onConvertLead: (lead: Lead) => void;
  onArchiveLead: (lead: Lead) => void;
  onDeleteLead: (lead: Lead) => void;
}

export function LeadTable({
  leads,
  isLoading = false,
  selectedIds,
  onSelectToggle,
  onSelectAllToggle,
  onSortChange,
  sortField: _sortField,
  sortOrder: _sortOrder,
  onEditLead,
  onConvertLead,
  onArchiveLead,
  onDeleteLead,
}: LeadTableProps) {
  const [openMenuId, setOpenMenuId] = React.useState<string | null>(null);

  const allSelected = leads.length > 0 && selectedIds.length === leads.length;

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'NEW':
        return <Badge variant="warning" className="text-[10px]">NEW</Badge>;
      case 'CONTACTED':
        return <Badge variant="secondary" className="text-[10px]">CONTACTED</Badge>;
      case 'QUALIFIED':
        return <Badge variant="default" className="text-[10px]">QUALIFIED</Badge>;
      case 'PROPOSAL_SENT':
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px]">PROPOSAL</Badge>;
      case 'NEGOTIATION':
        return <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-[10px]">NEGOTIATION</Badge>;
      case 'WON':
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] gap-1"><CheckCircle2 className="h-3 w-3" /> WON (CONVERTED)</Badge>;
      case 'LOST':
        return <Badge variant="outline" className="text-[10px] text-muted-foreground">LOST</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: LeadPriority) => {
    switch (priority) {
      case 'URGENT':
        return <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/10 text-red-600 border border-red-500/20">URGENT</span>;
      case 'HIGH':
        return <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 border border-orange-500/20">HIGH</span>;
      case 'MEDIUM':
        return <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 border border-blue-500/20">MEDIUM</span>;
      case 'LOW':
        return <span className="inline-flex items-center text-[10px] font-normal px-2 py-0.5 rounded bg-muted text-muted-foreground">LOW</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="border border-border rounded-xl bg-card p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-muted/60 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (leads.length === 0) {
    return (
      <div className="border border-dashed border-border rounded-xl p-12 text-center bg-card space-y-3">
        <Flame className="h-10 w-10 text-muted-foreground mx-auto" />
        <h3 className="text-base font-bold text-foreground">No leads found</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
          No business leads match your search criteria. Try adjusting your filters or create a new lead.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="p-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAllToggle}
                  className="rounded border-input text-primary focus:ring-primary"
                />
              </th>
              <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => onSortChange('name')}>
                <div className="flex items-center space-x-1">
                  <span>Lead Name & Company</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="p-3">Contact Info</th>
              <th className="p-3">Source</th>
              <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => onSortChange('status')}>
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => onSortChange('score')}>
                <div className="flex items-center space-x-1">
                  <span>Lead Score</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => onSortChange('priority')}>
                <div className="flex items-center space-x-1">
                  <span>Priority</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="p-3">Assigned Employee</th>
              <th className="p-3 cursor-pointer hover:text-foreground" onClick={() => onSortChange('createdAt')}>
                <div className="flex items-center space-x-1">
                  <span>Created</span>
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </th>
              <th className="p-3 w-12 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border/60 font-medium">
            {leads.map((lead) => {
              const isSelected = selectedIds.includes(lead.id);

              return (
                <tr
                  key={lead.id}
                  className={`hover:bg-muted/30 transition-colors ${
                    isSelected ? 'bg-primary/5' : ''
                  } ${lead.isArchived ? 'opacity-65 bg-muted/20' : ''}`}
                >
                  <td className="p-3 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onSelectToggle(lead.id)}
                      className="rounded border-input text-primary focus:ring-primary"
                    />
                  </td>

                  {/* Name & Company */}
                  <td className="p-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 text-purple-600 dark:text-purple-300 font-bold text-xs flex items-center justify-center shrink-0 border border-purple-500/20">
                        {lead.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <Link
                          href={`/crm/leads/${lead.id}`}
                          className="font-bold text-foreground hover:text-primary transition-colors flex items-center space-x-1"
                        >
                          <span>{lead.name}</span>
                          <ExternalLink className="h-3 w-3 opacity-0 hover:opacity-100 transition-opacity" />
                        </Link>
                        <div className="flex items-center space-x-1 text-[11px] text-muted-foreground">
                          <Building className="h-3 w-3 shrink-0" />
                          <span className="truncate max-w-[140px]">{lead.companyName}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact Info */}
                  <td className="p-3 text-muted-foreground space-y-0.5">
                    <div className="flex items-center space-x-1.5 truncate max-w-[160px]">
                      <Mail className="h-3 w-3 shrink-0 text-primary" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-[11px]">
                      <Phone className="h-3 w-3 shrink-0 text-muted-foreground" />
                      <span>{lead.phone}</span>
                    </div>
                  </td>

                  {/* Source */}
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[11px]">
                      {lead.source || 'Website'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="p-3">{getStatusBadge(lead.status)}</td>

                  {/* Score */}
                  <td className="p-3">
                    <LeadScoreBadge score={lead.score} size="sm" />
                  </td>

                  {/* Priority */}
                  <td className="p-3">{getPriorityBadge(lead.priority)}</td>

                  {/* Assigned Employee */}
                  <td className="p-3">
                    {lead.assignedEmployee ? (
                      <div className="flex items-center space-x-1.5">
                        <div className="h-6 w-6 rounded-full bg-primary/10 text-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                          {lead.assignedEmployee.fullName.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-foreground text-xs truncate max-w-[120px]">
                          {lead.assignedEmployee.fullName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-[11px] italic">Unassigned</span>
                    )}
                  </td>

                  {/* Created Date */}
                  <td className="p-3 text-muted-foreground text-[11px]">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>

                  {/* Actions Dropdown */}
                  <td className="p-3 text-right relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setOpenMenuId(openMenuId === lead.id ? null : lead.id)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>

                    {openMenuId === lead.id && (
                      <div className="absolute right-3 top-10 z-50 bg-popover border border-border rounded-lg shadow-xl w-48 py-1 text-left text-xs animate-in fade-in">
                        <Link
                          href={`/crm/leads/${lead.id}`}
                          className="flex items-center space-x-2 px-3 py-1.5 hover:bg-muted text-popover-foreground"
                          onClick={() => setOpenMenuId(null)}
                        >
                          <ExternalLink className="h-3.5 w-3.5 text-primary" />
                          <span>View Lead Profile</span>
                        </Link>
                        <button
                          type="button"
                          className="w-full text-left flex items-center space-x-2 px-3 py-1.5 hover:bg-muted text-popover-foreground"
                          onClick={() => {
                            setOpenMenuId(null);
                            onEditLead(lead);
                          }}
                        >
                          <Edit className="h-3.5 w-3.5 text-blue-500" />
                          <span>Edit Lead</span>
                        </button>
                        {!lead.isConverted && (
                          <button
                            type="button"
                            className="w-full text-left flex items-center space-x-2 px-3 py-1.5 hover:bg-muted text-emerald-600 font-semibold"
                            onClick={() => {
                              setOpenMenuId(null);
                              onConvertLead(lead);
                            }}
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Convert to Customer</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="w-full text-left flex items-center space-x-2 px-3 py-1.5 hover:bg-muted text-popover-foreground"
                          onClick={() => {
                            setOpenMenuId(null);
                            onArchiveLead(lead);
                          }}
                        >
                          <Archive className="h-3.5 w-3.5 text-amber-500" />
                          <span>{lead.isArchived ? 'Unarchive' : 'Archive'}</span>
                        </button>
                        <button
                          type="button"
                          className="w-full text-left flex items-center space-x-2 px-3 py-1.5 hover:bg-muted text-destructive font-semibold"
                          onClick={() => {
                            setOpenMenuId(null);
                            onDeleteLead(lead);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Soft Delete</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
