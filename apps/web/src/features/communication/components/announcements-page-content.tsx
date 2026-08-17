'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Announcement } from '@/features/communication/types/communication-types';
import { announcementFormSchema, AnnouncementFormValues } from '@/features/communication/schemas/communication-schemas';
import { fetchAnnouncements, createAnnouncement } from '@/features/communication/services/communication-service';
import { Plus, Megaphone, Loader2, X } from 'lucide-react';

const PRIORITY_STYLES: Record<string, string> = {
  LOW: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  NORMAL: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  HIGH: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  URGENT: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
};

const TYPE_STYLES: Record<string, string> = {
  COMPANY: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  TEAM: 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  PROJECT: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
};

interface AnnouncementsPageContentProps {
  projectId?: string;
}

export function AnnouncementsPageContent({ projectId }: AnnouncementsPageContentProps) {
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: '',
      description: '',
      type: 'COMPANY',
      priority: 'NORMAL',
    },
  });

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const a = await fetchAnnouncements(undefined, projectId);
      setAnnouncements(a);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const onSubmit = async (values: AnnouncementFormValues) => {
    await createAnnouncement({ ...values, projectId });
    reset();
    setShowForm(false);
    load();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10">
            <Megaphone className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Announcements</h1>
            <p className="text-xs text-muted-foreground">Company-wide, team, and project announcements</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} className="gap-1.5 text-xs font-bold">
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Cancel' : 'New Announcement'}
        </Button>
      </div>

      {/* New Announcement Form */}
      {showForm && (
        <Card className="shadow-xs border-primary/20 bg-primary/5">
          <CardContent className="p-5">
            <h2 className="text-sm font-bold text-foreground mb-4">Publish New Announcement</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Title <span className="text-destructive">*</span></label>
                <Input placeholder="Announcement title..." {...register('title')} className={errors.title ? 'border-destructive' : ''} />
                {errors.title && <p className="text-[11px] text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Message <span className="text-destructive">*</span></label>
                <Textarea placeholder="Write your announcement..." rows={4} {...register('description')} className={errors.description ? 'border-destructive' : ''} />
                {errors.description && <p className="text-[11px] text-destructive">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Type</label>
                  <select {...register('type')} className="w-full text-xs rounded-md border border-input bg-background p-2.5">
                    <option value="COMPANY">Company</option>
                    <option value="TEAM">Team</option>
                    <option value="PROJECT">Project</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Priority</label>
                  <select {...register('priority')} className="w-full text-xs rounded-md border border-input bg-background p-2.5">
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Expires At</label>
                  <Input type="date" {...register('expiresAt')} />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2 font-bold">
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Publish Announcement
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Announcements List */}
      {loading ? (
        <div className="py-12 text-center text-xs flex justify-center items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Loading announcements...</span>
        </div>
      ) : announcements.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground">
          No announcements yet. Publish the first one above.
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <Card key={ann.id} className={`shadow-2xs border-l-4 ${
              ann.priority === 'URGENT' ? 'border-l-rose-500' :
              ann.priority === 'HIGH' ? 'border-l-amber-500' :
              ann.priority === 'NORMAL' ? 'border-l-blue-500' :
              'border-l-slate-400'
            }`}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className={`text-[10px] font-bold ${PRIORITY_STYLES[ann.priority]}`}>
                        {ann.priority}
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] font-bold ${TYPE_STYLES[ann.type]}`}>
                        {ann.type}
                      </Badge>
                      {ann.expiresAt && new Date(ann.expiresAt) < new Date() && (
                        <Badge variant="secondary" className="text-[10px]">Expired</Badge>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-foreground">{ann.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{ann.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground border-t border-border pt-2">
                  {ann.author && <span>By <span className="font-bold text-foreground">{ann.author.fullName}</span></span>}
                  <span>{new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  {ann.expiresAt && (
                    <span>Expires: {new Date(ann.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
