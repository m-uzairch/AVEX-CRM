'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ProjectNote } from '../../types/project-types';
import {
  createProjectNote,
  updateProjectNote,
  deleteProjectNote,
} from '../../services/project-dashboard-service';
import {
  StickyNote,
  Pin,
  PinOff,
  Trash2,
  Edit,
  Plus,
  Loader2,
  User,
} from 'lucide-react';

interface ProjectNotesTabProps {
  projectId: string;
  notes: ProjectNote[];
  onNotesUpdated: () => void;
}

export function ProjectNotesTab({ projectId, notes, onNotesUpdated }: ProjectNotesTabProps) {
  const [newContent, setNewContent] = React.useState('');
  const [isPinned, setIsPinned] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [editingNoteId, setEditingNoteId] = React.useState<string | null>(null);
  const [editContent, setEditContent] = React.useState('');

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    try {
      setLoading(true);
      await createProjectNote(projectId, newContent, isPinned);
      setNewContent('');
      setIsPinned(false);
      onNotesUpdated();
    } catch (err) {
      console.error('Failed to create project note:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePin = async (note: ProjectNote) => {
    try {
      await updateProjectNote(projectId, note.id, { isPinned: !note.isPinned });
      onNotesUpdated();
    } catch (err) {
      console.error('Failed to pin note:', err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (confirm('Are you sure you want to delete this project note?')) {
      try {
        await deleteProjectNote(projectId, noteId);
        onNotesUpdated();
      } catch (err) {
        console.error('Failed to delete note:', err);
      }
    }
  };

  const handleStartEdit = (note: ProjectNote) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = async (noteId: string) => {
    try {
      await updateProjectNote(projectId, noteId, { content: editContent });
      setEditingNoteId(null);
      onNotesUpdated();
    } catch (err) {
      console.error('Failed to update note content:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Note Card */}
      <Card>
        <CardHeader className="p-5 pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-primary" />
            Add Project Note
          </CardTitle>
          <CardDescription>Record key decisions, client instructions, or internal developer notes.</CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <form onSubmit={handleCreateNote} className="space-y-3">
            <Textarea
              placeholder="Write internal note here..."
              rows={3}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="text-xs"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary h-3.5 w-3.5"
                />
                <span>Pin to top of project dashboard</span>
              </label>

              <Button type="submit" disabled={loading || !newContent.trim()} size="sm" className="gap-1.5 text-xs">
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Add Note
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Notes List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Project Notes ({notes.length})
        </h3>

        {notes.length === 0 ? (
          <Card className="p-8 text-center text-xs text-muted-foreground">
            No project notes recorded yet. Use the form above to add your first note.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <Card
                key={note.id}
                className={`transition-all duration-200 ${
                  note.isPinned ? 'border-primary/50 bg-primary/5 shadow-xs' : 'border-border bg-card'
                }`}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-border/50 pb-2">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      <span className="font-semibold text-foreground">{note.createdBy?.fullName || 'User'}</span>
                      <span>•</span>
                      <span className="text-[10px]">
                        {new Date(note.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleTogglePin(note)}
                        className={`h-7 w-7 ${note.isPinned ? 'text-primary' : 'text-muted-foreground'}`}
                        title={note.isPinned ? 'Unpin Note' : 'Pin Note'}
                      >
                        {note.isPinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleStartEdit(note)}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="Edit Note"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteNote(note.id)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        title="Delete Note"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {editingNoteId === note.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="text-xs"
                        rows={3}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setEditingNoteId(null)} className="text-xs h-7">
                          Cancel
                        </Button>
                        <Button size="sm" onClick={() => handleSaveEdit(note.id)} className="text-xs h-7">
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">{note.content}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
