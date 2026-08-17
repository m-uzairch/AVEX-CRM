/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { MessageSquare, Plus, Clock, Search, Trash2, Pin, Paperclip, UserCheck } from 'lucide-react';
import { CRMNote, NoteAttachment, UserMention } from '../../types/activity-note-types';
import { NoteService } from '../../services/note-service';
import { RichTextEditor } from '../common/rich-text-editor';
import { FileAttachmentPicker } from '../common/file-attachment-picker';

export interface CustomerNotesSectionProps {
  customerId: string;
  searchQuery?: string;
}

export function CustomerNotesSection({ customerId, searchQuery = '' }: CustomerNotesSectionProps) {
  const [notes, setNotes] = React.useState<CRMNote[]>([]);
  const [content, setContent] = React.useState('');
  const [isPinned, setIsPinned] = React.useState(false);
  const [attachments, setAttachments] = React.useState<NoteAttachment[]>([]);
  const [mentions, setMentions] = React.useState<UserMention[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [localSearch, setLocalSearch] = React.useState(searchQuery);

  const loadNotes = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await NoteService.fetchNotes('CUSTOMER', customerId);
      setNotes(data);
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  React.useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  React.useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await NoteService.createNote({
        entityType: 'CUSTOMER',
        entityId: customerId,
        content: content.trim(),
        isPinned,
        attachments,
        mentions,
      });

      setNotes((prev) => [created, ...prev]);
      setContent('');
      setIsPinned(false);
      setAttachments([]);
      setMentions([]);
    } catch (err: any) {
      alert(err?.message || 'Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePin = async (note: CRMNote) => {
    try {
      const newPinState = !note.isPinned;
      await NoteService.updateNote({
        entityType: 'CUSTOMER',
        entityId: customerId,
        noteId: note.id,
        isPinned: newPinState,
      });
      setNotes((prev) =>
        prev
          .map((n) => (n.id === note.id ? { ...n, isPinned: newPinState } : n))
          .sort((a, b) => Number(b.isPinned) - Number(a.isPinned))
      );
    } catch (err: any) {
      alert(err?.message || 'Failed to pin note');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this internal team note?')) return;
    try {
      await NoteService.deleteNote('CUSTOMER', customerId, noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
    } catch (err: any) {
      alert(err?.message || 'Failed to delete note');
    }
  };

  const filteredNotes = notes.filter((n) => {
    if (!localSearch.trim()) return true;
    const q = localSearch.toLowerCase();
    return (
      n.content.toLowerCase().includes(q) ||
      (n.createdBy?.fullName && n.createdBy.fullName.toLowerCase().includes(q))
    );
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.isPinned);

  return (
    <Card className="shadow-xs border-border text-xs">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-2 border-b border-border/60">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <h3 className="font-bold text-sm text-foreground">Customer Interaction Notes</h3>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes or mentions..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md border border-input bg-background text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        {/* Create Rich Text Note Form */}
        <form onSubmit={handleAddNote} className="bg-muted/30 border border-border p-4 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-xs text-foreground flex items-center space-x-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              <span>New Team Internal Note</span>
            </span>

            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                isPinned
                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                  : 'bg-background text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              <Pin className={`h-3 w-3 ${isPinned ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>{isPinned ? 'Pinned Note' : 'Pin to Top'}</span>
            </button>
          </div>

          <RichTextEditor
            value={content}
            onChange={setContent}
            onMentionsChange={setMentions}
            placeholder="Record client call details, meeting summaries, or tag team members with @..."
          />

          {/* Attachment upload control */}
          <FileAttachmentPicker attachments={attachments} onChange={setAttachments} />

          <div className="flex justify-end pt-1">
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !content.trim()}
              className="gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{isSubmitting ? 'Posting Note...' : 'Post Internal Note'}</span>
            </Button>
          </div>
        </form>

        {/* Notes Feed Container */}
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground space-y-2">
            <Spinner className="h-5 w-5 mx-auto" />
            <p className="text-xs">Loading interaction notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground">
            No notes found. Use the box above to add internal team notes.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pinned Notes Section */}
            {pinnedNotes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-1.5 text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                  <Pin className="h-3.5 w-3.5 fill-amber-500" />
                  <span>Pinned Important Notes ({pinnedNotes.length})</span>
                </div>
                {pinnedNotes.map((note) => (
                  <NoteItemCard
                    key={note.id}
                    note={note}
                    onTogglePin={() => handleTogglePin(note)}
                    onDelete={() => handleDeleteNote(note.id)}
                  />
                ))}
              </div>
            )}

            {/* Standard Feed Section */}
            {unpinnedNotes.length > 0 && (
              <div className="space-y-3">
                {pinnedNotes.length > 0 && (
                  <h4 className="font-bold text-[11px] text-muted-foreground uppercase tracking-wider pt-2">
                    Recent Notes ({unpinnedNotes.length})
                  </h4>
                )}
                {unpinnedNotes.map((note) => (
                  <NoteItemCard
                    key={note.id}
                    note={note}
                    onTogglePin={() => handleTogglePin(note)}
                    onDelete={() => handleDeleteNote(note.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NoteItemCard({
  note,
  onTogglePin,
  onDelete,
}: {
  note: CRMNote;
  onTogglePin: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`bg-card border p-4 rounded-xl space-y-3 relative group transition-all text-xs ${
        note.isPinned
          ? 'border-amber-500/40 bg-amber-500/5 shadow-2xs'
          : 'border-border/80 hover:border-border'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20 shrink-0">
            {note.createdBy?.fullName
              ? note.createdBy.fullName.substring(0, 2).toUpperCase()
              : 'AC'}
          </div>
          <div>
            <span className="font-semibold text-foreground">
              {note.createdBy?.fullName || 'Alex Carter'}
            </span>
            <span className="text-[11px] text-muted-foreground block">
              {note.createdBy?.email || 'Team Member'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-muted-foreground">
          <div className="flex items-center space-x-1 text-[11px] mr-2">
            <Clock className="h-3 w-3" />
            <span>{new Date(note.createdAt).toLocaleString()}</span>
          </div>

          <button
            type="button"
            onClick={onTogglePin}
            className={`p-1 rounded hover:bg-muted transition-colors ${
              note.isPinned ? 'text-amber-500' : 'text-muted-foreground hover:text-foreground'
            }`}
            title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
          >
            <Pin className={`h-3.5 w-3.5 ${note.isPinned ? 'fill-amber-500' : ''}`} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
            title="Delete Note"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Note Content */}
      <div className="text-foreground/90 whitespace-pre-wrap leading-relaxed pl-9">
        {note.content}
      </div>

      {/* Mentions badges */}
      {note.mentions && note.mentions.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pl-9 pt-1 text-[11px]">
          <span className="text-muted-foreground font-medium flex items-center space-x-1">
            <UserCheck className="h-3 w-3 text-primary" />
            <span>Mentions:</span>
          </span>
          {note.mentions.map((m) => (
            <span
              key={m.userId}
              className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium text-[10px]"
            >
              @{m.fullName}
            </span>
          ))}
        </div>
      )}

      {/* Attachments preview */}
      {note.attachments && note.attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 pl-9 pt-1">
          {note.attachments.map((att) => (
            <a
              key={att.id}
              href={att.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-muted border border-border/60 hover:bg-muted/80 text-xs font-medium text-foreground transition-colors"
            >
              <Paperclip className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="truncate max-w-[150px]">{att.fileName}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
