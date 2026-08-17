'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Meeting, MeetingNote } from '@/features/communication/types/communication-types';
import { MeetingFormValues } from '@/features/communication/schemas/communication-schemas';
import {
  fetchMeetings,
  createMeeting,
  updateMeetingStatus,
  addMeetingNote,
} from '@/features/communication/services/communication-service';
import { MeetingDialog } from '@/features/communication/components/meeting-dialog';
import { ProjectChatTab } from '@/features/communication/components/project-chat-tab';
import {
  Plus,
  Video,
  MapPin,
  Calendar,
  Clock,
  Link as LinkIcon,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
  MessageSquare,
} from 'lucide-react';

interface ProjectMeetingsTabProps {
  projectId: string;
}

const STATUS_STYLES: Record<string, string> = {
  SCHEDULED: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  COMPLETED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  CANCELLED: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
};

type ActiveSection = 'chat' | 'meetings';

export function ProjectMeetingsTab({ projectId }: ProjectMeetingsTabProps) {
  const [section, setSection] = React.useState<ActiveSection>('chat');
  const [meetings, setMeetings] = React.useState<Meeting[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = React.useState(false);
  const [expandedMeetingId, setExpandedMeetingId] = React.useState<string | null>(null);
  const [noteContent, setNoteContent] = React.useState('');
  const [addingNote, setAddingNote] = React.useState(false);

  const loadMeetings = React.useCallback(async () => {
    try {
      setLoading(true);
      const ms = await fetchMeetings(projectId);
      setMeetings(ms);
    } catch (err) {
      console.error('Failed to load meetings:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    if (section === 'meetings') loadMeetings();
  }, [section, loadMeetings]);

  const handleSchedule = async (values: MeetingFormValues) => {
    await createMeeting({ ...values, projectId });
    loadMeetings();
  };

  const handleCancelMeeting = async (meetingId: string) => {
    if (confirm('Cancel this meeting?')) {
      await updateMeetingStatus(meetingId, 'CANCELLED');
      loadMeetings();
    }
  };

  const handleAddNote = async (meetingId: string) => {
    if (!noteContent.trim()) return;
    try {
      setAddingNote(true);
      await addMeetingNote(meetingId, noteContent);
      setNoteContent('');
      loadMeetings();
    } finally {
      setAddingNote(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Switcher */}
      <div className="flex items-center space-x-1 bg-card border border-border rounded-xl p-1 w-fit">
        <button
          onClick={() => setSection('chat')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            section === 'chat' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" /> Project Chat
        </button>
        <button
          onClick={() => setSection('meetings')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
            section === 'meetings' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Calendar className="h-3.5 w-3.5" /> Meetings
        </button>
      </div>

      {section === 'chat' ? (
        <ProjectChatTab projectId={projectId} />
      ) : (
        <div className="space-y-4">
          {/* Meetings Header */}
          <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4 shadow-2xs">
            <div>
              <h2 className="text-sm font-bold text-foreground">Scheduled Meetings</h2>
              <p className="text-[10px] text-muted-foreground">{meetings.filter((m) => m.status === 'SCHEDULED').length} upcoming meetings</p>
            </div>
            <Button size="sm" onClick={() => setIsScheduleOpen(true)} className="gap-1.5 text-xs font-bold">
              <Plus className="h-4 w-4" /> Schedule Meeting
            </Button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground flex justify-center items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Loading meetings...</span>
            </div>
          ) : meetings.length === 0 ? (
            <Card className="p-8 text-center text-xs text-muted-foreground">
              No meetings scheduled yet. Click &quot;Schedule Meeting&quot; above.
            </Card>
          ) : (
            <div className="space-y-3">
              {meetings.map((meeting) => {
                const isExpanded = expandedMeetingId === meeting.id;
                const start = new Date(meeting.startTime);
                const end = new Date(meeting.endTime);
                const durationMin = Math.round((end.getTime() - start.getTime()) / 60000);

                return (
                  <Card key={meeting.id} className="shadow-2xs hover:border-primary/30 transition-colors">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <Badge variant="outline" className={`text-[10px] font-bold ${STATUS_STYLES[meeting.status]}`}>
                              {meeting.status}
                            </Badge>
                            <Badge variant="secondary" className="text-[10px]">
                              {meeting.meetingType === 'ONLINE' ? (
                                <><Video className="h-3 w-3 mr-1" />Online</>
                              ) : (
                                <><MapPin className="h-3 w-3 mr-1" />In Person</>
                              )}
                            </Badge>
                            {meeting.isClientVisible && (
                              <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-600 border-purple-500/20 font-semibold">
                                Client Invited
                              </Badge>
                            )}
                          </div>

                          <h3 className="font-bold text-sm text-foreground">{meeting.title}</h3>
                          {meeting.description && (
                            <p className="text-xs text-muted-foreground">{meeting.description}</p>
                          )}
                        </div>

                        <div className="flex items-center space-x-1.5 shrink-0">
                          {meeting.status === 'SCHEDULED' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                              onClick={() => handleCancelMeeting(meeting.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setExpandedMeetingId(isExpanded ? null : meeting.id)}
                          >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      {/* Date/Time Row */}
                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground border-t border-border pt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <span className="text-[10px]">({durationMin}min)</span>
                        </span>
                        {meeting.meetingLink && (
                          <a
                            href={meeting.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline font-semibold"
                          >
                            <LinkIcon className="h-3.5 w-3.5" /> Join Meeting
                          </a>
                        )}
                        {meeting.organizer && (
                          <span>Organized by <span className="font-bold text-foreground">{meeting.organizer.fullName}</span></span>
                        )}
                      </div>

                      {/* Expanded: Notes & Participants */}
                      {isExpanded && (
                        <div className="pt-3 border-t border-border space-y-4">
                          {/* Participants */}
                          {meeting.participants && meeting.participants.length > 0 && (
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold uppercase text-muted-foreground">Participants</span>
                              <div className="flex flex-wrap gap-2">
                                {meeting.participants.map((p) => (
                                  <div key={p.id} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted text-xs font-semibold">
                                    <div className="h-5 w-5 rounded-full bg-primary/15 flex items-center justify-center text-[9px] font-bold text-primary">
                                      {p.user.fullName[0]}
                                    </div>
                                    {p.user.fullName}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Meeting Notes */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                              <FileText className="h-3.5 w-3.5 text-primary" /> Meeting Notes ({meeting.notes?.length || 0})
                            </span>

                            {meeting.notes && meeting.notes.length > 0 && (
                              <div className="divide-y divide-border border border-border rounded-lg bg-card overflow-hidden">
                                {meeting.notes.map((note: MeetingNote) => (
                                  <div key={note.id} className="p-3 text-xs">
                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                                      <span className="font-bold">{note.author?.fullName}</span>
                                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{note.content}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {meeting.status !== 'CANCELLED' && (
                              <div className="flex space-x-2">
                                <Textarea
                                  placeholder="Add a meeting note, action item, or decision..."
                                  rows={2}
                                  value={noteContent}
                                  onChange={(e) => setNoteContent(e.target.value)}
                                  className="text-xs bg-background"
                                />
                                <Button
                                  size="sm"
                                  disabled={addingNote || !noteContent.trim()}
                                  onClick={() => handleAddNote(meeting.id)}
                                  className="self-end gap-1.5"
                                >
                                  {addingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                  Add Note
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <MeetingDialog
            open={isScheduleOpen}
            onOpenChange={setIsScheduleOpen}
            projectId={projectId}
            onSave={handleSchedule}
          />
        </div>
      )}
    </div>
  );
}
