'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ChangeRequest, ClientProjectOverview } from '@/features/portal/types/portal-types';
import { changeRequestFormSchema, ChangeRequestFormValues } from '@/features/portal/schemas/portal-schemas';
import { fetchChangeRequests, createChangeRequest, fetchClientProjects } from '@/features/portal/services/portal-service';
import { FileEdit, Plus, Loader2, Calendar } from 'lucide-react';

export default function ClientChangeRequestsPage() {
  const [requests, setRequests] = React.useState<ChangeRequest[]>([]);
  const [projects, setProjects] = React.useState<ClientProjectOverview[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [reqData, projData] = await Promise.all([fetchChangeRequests(), fetchClientProjects()]);
      setRequests(reqData);
      setProjects(projData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangeRequestFormValues>({
    resolver: zodResolver(changeRequestFormSchema),
    defaultValues: {
      projectId: '',
      title: '',
      description: '',
      priority: 'MEDIUM',
    },
  });

  const onSubmit = async (values: ChangeRequestFormValues) => {
    try {
      setSubmitting(true);
      await createChangeRequest(values);
      setIsModalOpen(false);
      reset();
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileEdit className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Change Requests</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Submit scope modifications, design revisions, or additional feature requests for review.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-1.5 text-xs font-bold">
          <Plus className="h-4 w-4" /> Submit Change Request
        </Button>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground flex justify-center items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Loading change requests...</span>
        </div>
      ) : requests.length === 0 ? (
        <Card className="p-8 text-center text-xs text-muted-foreground">
          No change requests submitted yet. Click &quot;Submit Change Request&quot; above to submit a new scope request.
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id} className="hover:border-primary/40 transition-colors shadow-xs">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      {req.project && (
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground">
                          {req.project.projectCode}
                        </span>
                      )}
                      <Badge variant="outline" className="text-[10px] uppercase font-bold">
                        Status: {req.status}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] uppercase">
                        Priority: {req.priority}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-base text-foreground">{req.title}</h3>
                  </div>

                  <span className="text-[11px] text-muted-foreground flex items-center gap-1 shrink-0">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{req.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Submit Change Request Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Scope Change Request"
        description="Provide details regarding the feature or design revision you would like to request."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs py-2">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Project *</label>
            <select
              {...register('projectId')}
              className="w-full text-xs rounded-md border border-input bg-background p-2.5"
            >
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.projectCode} - {p.name}
                </option>
              ))}
            </select>
            {errors.projectId && <p className="text-[11px] text-destructive">{errors.projectId.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Request Title *</label>
            <Input placeholder="e.g. Add Stripe Payment Gateway Integration" {...register('title')} />
            {errors.title && <p className="text-[11px] text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Detailed Description *</label>
            <Textarea placeholder="Explain what changes are needed..." rows={4} {...register('description')} />
            {errors.description && <p className="text-[11px] text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Priority</label>
            <select {...register('priority')} className="w-full text-xs rounded-md border border-input bg-background p-2.5">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
