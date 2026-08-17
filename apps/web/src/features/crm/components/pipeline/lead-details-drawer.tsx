'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  X,
  Building,
  Mail,
  Phone,
  DollarSign,
  Target,
  UserCheck,
  Edit,
  Archive,
  Trash2,
  ExternalLink,
  History,
  MessageSquare,
  Activity,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lead, LeadStatus } from '../../types/lead-types';
import { LeadStageHistoryRecord } from '../../types/pipeline-types';
import { updateDealInfo, fetchStageHistory, updateLeadStage } from '../../services/pipeline-service';
import { LeadScoreBadge } from '../leads/lead-score-badge';
import { LeadNotesSection } from '../leads/lead-notes-section';
import { LeadActivityTimeline } from '../leads/lead-activity-timeline';

interface LeadDetailsDrawerProps {
  lead: Lead | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdated: () => void;
  onConvertLead?: (lead: Lead) => void;
  onEditLead?: (lead: Lead) => void;
  onArchiveLead?: (lead: Lead) => void;
  onDeleteLead?: (lead: Lead) => void;
}

export function LeadDetailsDrawer({
  lead,
  isOpen,
  onClose,
  onLeadUpdated,
  onConvertLead,
  onEditLead,
  onArchiveLead,
  onDeleteLead,
}: LeadDetailsDrawerProps) {
  const [activeTab, setActiveTab] = React.useState<'deal' | 'notes' | 'activity' | 'history'>('deal');
  const [stageHistory, setStageHistory] = React.useState<LeadStageHistoryRecord[]>([]);
  const [isUpdatingDeal, setIsUpdatingDeal] = React.useState(false);

  // Deal Form State
  const [dealValue, setDealValue] = React.useState(0);
  const [winProb, setWinProb] = React.useState(50);
  const [closingDate, setClosingDate] = React.useState('');

  React.useEffect(() => {
    if (lead) {
      setDealValue(lead.expectedDealValue || 0);
      setWinProb(lead.winProbability ?? 50);
      setClosingDate(
        lead.expectedClosingDate
          ? new Date(lead.expectedClosingDate).toISOString().split('T')[0]
          : ''
      );

      // Fetch Stage History
      fetchStageHistory(lead.id)
        .then(setStageHistory)
        .catch(() => setStageHistory([]));
    }
  }, [lead, isOpen]);

  if (!isOpen || !lead) return null;

  const handleSaveDealInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdatingDeal(true);
      await updateDealInfo(lead.id, {
        expectedDealValue: dealValue,
        winProbability: winProb,
        expectedClosingDate: closingDate,
      });
      onLeadUpdated();
    } catch (err: any) {
      alert(err?.message || 'Failed to update deal info');
    } finally {
      setIsUpdatingDeal(false);
    }
  };

  const handleStageSelect = async (newStage: LeadStatus) => {
    if (newStage === lead.status) return;
    try {
      await updateLeadStage(lead.id, newStage);
      onLeadUpdated();
    } catch (err: any) {
      alert(err?.message || 'Failed to change stage');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-card border-l border-border shadow-2xl flex flex-col text-card-foreground text-xs">
          {/* Header */}
          <div className="p-5 border-b border-border bg-muted/20 flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-foreground">{lead.name}</h2>
                <Badge variant="outline" className="text-[10px]">
                  {lead.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center space-x-1.5">
                <Building className="h-3.5 w-3.5" />
                <span className="font-semibold text-foreground">{lead.companyName}</span>
                <span>•</span>
                <span>Source: {lead.source}</span>
              </p>
            </div>

            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Action Strip */}
          <div className="p-3 bg-muted/40 border-b border-border flex flex-wrap items-center gap-2">
            {!lead.isConverted && onConvertLead && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-[11px] h-7"
                onClick={() => onConvertLead(lead)}
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Convert</span>
              </Button>
            )}

            {onEditLead && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-[11px] h-7"
                onClick={() => onEditLead(lead)}
              >
                <Edit className="h-3.5 w-3.5 text-blue-500" />
                <span>Edit</span>
              </Button>
            )}

            {onArchiveLead && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-[11px] h-7"
                onClick={() => onArchiveLead(lead)}
              >
                <Archive className="h-3.5 w-3.5 text-amber-500" />
                <span>{lead.isArchived ? 'Unarchive' : 'Archive'}</span>
              </Button>
            )}

            {onDeleteLead && (
              <Button
                variant="destructive"
                size="sm"
                className="gap-1 text-[11px] h-7"
                onClick={() => onDeleteLead(lead)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </Button>
            )}

            <Link href={`/crm/leads/${lead.id}`} className="ml-auto">
              <Button variant="ghost" size="sm" className="gap-1 text-[11px] h-7">
                <span>Full Profile</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </Link>
          </div>

          {/* Tabs header */}
          <div className="flex border-b border-border px-5 pt-3 space-x-4">
            <button
              type="button"
              onClick={() => setActiveTab('deal')}
              className={`pb-2 text-xs font-semibold flex items-center space-x-1 border-b-2 transition-colors ${
                activeTab === 'deal'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <DollarSign className="h-3.5 w-3.5" />
              <span>Deal & Stage</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`pb-2 text-xs font-semibold flex items-center space-x-1 border-b-2 transition-colors ${
                activeTab === 'notes'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Notes ({lead.notes?.length || 0})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('activity')}
              className={`pb-2 text-xs font-semibold flex items-center space-x-1 border-b-2 transition-colors ${
                activeTab === 'activity'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Activity</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`pb-2 text-xs font-semibold flex items-center space-x-1 border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              <span>Stage History ({stageHistory.length})</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {activeTab === 'deal' && (
              <div className="space-y-6">
                {/* Stage Selector */}
                <div className="bg-muted/40 border border-border p-3.5 rounded-xl space-y-2">
                  <label className="font-bold text-foreground block">Pipeline Stage</label>
                  <select
                    value={lead.status}
                    onChange={(e) => handleStageSelect(e.target.value as LeadStatus)}
                    className="w-full text-xs p-2 rounded-md border border-input bg-background font-semibold"
                  >
                    <option value="NEW">New Lead</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="QUALIFIED">Qualified</option>
                    <option value="PROPOSAL_SENT">Proposal Sent</option>
                    <option value="NEGOTIATION">Negotiation</option>
                    <option value="WON">Won (Converted)</option>
                    <option value="LOST">Lost Opportunity</option>
                  </select>
                </div>

                {/* Deal Info Form */}
                <form onSubmit={handleSaveDealInfo} className="bg-card border border-border p-4 rounded-xl space-y-4">
                  <h3 className="font-bold text-foreground flex items-center space-x-1.5">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    <span>Opportunity & Deal Parameters</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-medium text-muted-foreground block mb-1">Expected Value ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={dealValue}
                        onChange={(e) => setDealValue(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs p-2 rounded-md border border-input bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-muted-foreground block mb-1">Target Closing Date</label>
                      <input
                        type="date"
                        value={closingDate}
                        onChange={(e) => setClosingDate(e.target.value)}
                        className="w-full text-xs p-2 rounded-md border border-input bg-background text-foreground"
                      />
                    </div>
                  </div>

                  {/* Win Probability slider */}
                  <div className="space-y-2 pt-1 border-t border-border/60">
                    <div className="flex justify-between items-center">
                      <label className="font-medium text-muted-foreground flex items-center space-x-1">
                        <Target className="h-3.5 w-3.5 text-indigo-500" />
                        <span>Win Probability ({winProb}%)</span>
                      </label>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{winProb}% Chance</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={winProb}
                      onChange={(e) => setWinProb(parseInt(e.target.value, 10))}
                      className="w-full h-2 bg-input rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" size="sm" disabled={isUpdatingDeal} className="h-8 text-xs">
                      {isUpdatingDeal ? 'Saving Deal...' : 'Save Deal Parameters'}
                    </Button>
                  </div>
                </form>

                {/* Quick Info Grid */}
                <div className="bg-card border border-border p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground">Lead Qualification Score</span>
                    <LeadScoreBadge score={lead.score} size="sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-2 border-t border-border/60">
                    <div className="flex items-center space-x-1.5 truncate">
                      <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 truncate">
                      <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{lead.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <LeadNotesSection leadId={lead.id} initialNotes={lead.notes} />
            )}

            {activeTab === 'activity' && (
              <LeadActivityTimeline logs={lead.activityLogs} />
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-foreground uppercase tracking-wider">
                  Stage Transition Audit Trail
                </h4>

                {stageHistory.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground text-xs">
                    No stage transitions recorded yet.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {stageHistory.map((item) => (
                      <div
                        key={item.id}
                        className="bg-card border border-border/80 p-3 rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-[10px]">
                            {item.fromStage}
                          </Badge>
                          <ArrowRight className="h-3.5 w-3.5 text-primary" />
                          <Badge variant="default" className="text-[10px]">
                            {item.toStage}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1.5 text-[11px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(item.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
