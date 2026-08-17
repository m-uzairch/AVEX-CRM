'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Project } from '../../types/project-types';
import { Users, Mail, Plus } from 'lucide-react';

interface ProjectTeamTabProps {
  project: Project;
  onManageTeam?: () => void;
}

export function ProjectTeamTab({ project, onManageTeam }: ProjectTeamTabProps) {
  const members = project.members || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Project Workspace Team
            </CardTitle>
            <CardDescription>Assigned project leads, employees, and team collaborators.</CardDescription>
          </div>
          {onManageTeam && (
            <Button size="sm" onClick={onManageTeam} className="gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" /> Edit Team Members
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {/* Project Manager Card */}
          {project.projectManager && (
            <div className="mb-6 p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs">
                  {project.projectManager.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-foreground">{project.projectManager.fullName}</span>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary text-primary-foreground">
                      Project Lead
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{project.projectManager.email}</p>
                </div>
              </div>

              <a
                href={`mailto:${project.projectManager.email}`}
                className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
              >
                <Mail className="h-3.5 w-3.5" /> Contact PM
              </a>
            </div>
          )}

          {/* Members List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Assigned Team Members ({members.length})
            </h3>

            {members.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No additional team members assigned.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="p-3.5 rounded-lg border border-border bg-card flex items-center justify-between hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-full bg-muted border border-border text-foreground font-bold flex items-center justify-center text-xs">
                        {member.user?.fullName
                          ? member.user.fullName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .substring(0, 2)
                          : 'U'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{member.user?.fullName || 'User'}</p>
                        <p className="text-[11px] text-muted-foreground">{member.user?.email}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground">
                      {member.role.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
