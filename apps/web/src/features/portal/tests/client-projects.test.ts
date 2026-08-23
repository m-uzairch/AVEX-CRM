import { describe, it, expect } from 'vitest';
import {
  formatClientPhases,
  sanitizeClientTasks,
  resolveProjectNextStep,
  calculateClientTaskStats,
} from '../services/portal-project-helper';
import { ClientProjectOverview } from '../types/portal-types';

describe('Client Project View Unit Tests', () => {
  const mockMilestones = [
    {
      id: 'ms-1',
      title: 'Discovery & Planning',
      description: 'Initial requirements and architecture',
      order: 1,
      status: 'COMPLETED',
      progressPercentage: 100,
      startDate: new Date('2026-08-01'),
      dueDate: new Date('2026-08-10'),
      completionDate: new Date('2026-08-09'),
    },
    {
      id: 'ms-2',
      title: 'Design & Prototyping',
      description: 'Figma mockups and user flow validation',
      order: 2,
      status: 'IN_PROGRESS',
      progressPercentage: 60,
      startDate: new Date('2026-08-11'),
      dueDate: new Date('2026-08-25'),
    },
    {
      id: 'ms-3',
      title: 'Backend Integration',
      description: 'API and database setup',
      order: 3,
      status: 'NOT_STARTED',
      progressPercentage: 0,
      startDate: new Date('2026-08-26'),
      dueDate: new Date('2026-09-10'),
    },
  ];

  const mockTasks = [
    {
      id: 'task-1',
      title: 'Review wireframe sketches',
      description: 'Client feedback on sketches',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      dueDate: new Date('2026-08-15'),
      createdAt: new Date('2026-08-10'),
      // Internal fields that should be sanitized out:
      internalNotes: 'Secret internal note',
      hourlyRate: 150,
      comments: [{ id: 'c1', text: 'Internal developer debate' }],
    },
    {
      id: 'task-2',
      title: 'Approve High-Fidelity Mockups',
      description: 'Client sign-off on Figma prototypes',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date('2026-08-24'),
      createdAt: new Date('2026-08-12'),
      internalNotes: 'Client has been slow to review',
      comments: [{ id: 'c2', text: 'Ping client again tomorrow' }],
    },
  ];

  describe('1. formatClientPhases', () => {
    it('correctly maps and sorts milestones into structured phases with current phase highlight', () => {
      const phases = formatClientPhases(mockMilestones);

      expect(phases).toHaveLength(3);
      expect(phases[0].title).toBe('Discovery & Planning');
      expect(phases[0].status).toBe('COMPLETED');
      expect(phases[0].isCurrent).toBe(false);

      // ms-2 is the first non-completed milestone, so it should be marked as current
      expect(phases[1].title).toBe('Design & Prototyping');
      expect(phases[1].status).toBe('IN_PROGRESS');
      expect(phases[1].isCurrent).toBe(true);

      expect(phases[2].title).toBe('Backend Integration');
      expect(phases[2].status).toBe('NOT_STARTED');
      expect(phases[2].isCurrent).toBe(false);
    });

    it('handles empty milestones gracefully', () => {
      const phases = formatClientPhases([]);
      expect(phases).toEqual([]);
    });
  });

  describe('2. sanitizeClientTasks', () => {
    it('strictly sanitizes task objects and removes all internal comments and private fields', () => {
      const sanitized = sanitizeClientTasks(mockTasks);

      expect(sanitized).toHaveLength(2);
      expect(sanitized[0].id).toBe('task-1');
      expect(sanitized[0].title).toBe('Review wireframe sketches');
      expect(sanitized[0].status).toBe('COMPLETED');
      expect(sanitized[0].priority).toBe('MEDIUM');

      // Verify internal properties are not leaked
      expect((sanitized[0] as any).internalNotes).toBeUndefined();
      expect((sanitized[0] as any).hourlyRate).toBeUndefined();
      expect((sanitized[0] as any).comments).toBeUndefined();
    });

    it('filters out soft-deleted tasks', () => {
      const tasksWithDeleted = [
        ...mockTasks,
        {
          id: 'task-deleted',
          title: 'Deleted Task',
          status: 'CANCELLED',
          priority: 'LOW',
          deletedAt: new Date(),
        },
      ];

      const sanitized = sanitizeClientTasks(tasksWithDeleted);
      expect(sanitized).toHaveLength(2);
      expect(sanitized.find((t) => t.id === 'task-deleted')).toBeUndefined();
    });
  });

  describe('3. resolveProjectNextStep', () => {
    it('resolves active milestone and upcoming task into a contextual next step', () => {
      const nextStep = resolveProjectNextStep(
        { status: 'IN_PROGRESS' },
        mockMilestones,
        mockTasks
      );

      expect(nextStep).toContain('Phase "Design & Prototyping"');
      expect(nextStep).toContain('Approve High-Fidelity Mockups');
    });

    it('returns completed message when project status is COMPLETED', () => {
      const nextStep = resolveProjectNextStep(
        { status: 'COMPLETED' },
        mockMilestones,
        mockTasks
      );

      expect(nextStep).toBe('Project deliverables have been completed and approved.');
    });

    it('returns on-hold notice when project status is ON_HOLD', () => {
      const nextStep = resolveProjectNextStep(
        { status: 'ON_HOLD' },
        mockMilestones,
        mockTasks
      );

      expect(nextStep).toContain('on hold');
    });

    it('returns planning notice when project status is PLANNING', () => {
      const nextStep = resolveProjectNextStep(
        { status: 'PLANNING' },
        [],
        []
      );

      expect(nextStep).toContain('Finalizing project scope');
    });
  });

  describe('4. Project Filtering and Search', () => {
    const mockProjects: ClientProjectOverview[] = [
      {
        id: 'p1',
        projectCode: 'PRJ-101',
        name: 'Alpha Redesign',
        status: 'IN_PROGRESS',
        completionPercentage: 45,
        currentPhase: 'Design',
        startDate: '2026-08-01',
      },
      {
        id: 'p2',
        projectCode: 'PRJ-102',
        name: 'Beta Migration',
        status: 'COMPLETED',
        completionPercentage: 100,
        currentPhase: 'Delivered',
        startDate: '2026-07-01',
      },
      {
        id: 'p3',
        projectCode: 'PRJ-103',
        name: 'Gamma Setup',
        status: 'PLANNING',
        completionPercentage: 10,
        currentPhase: 'Planning',
        startDate: '2026-08-20',
      },
    ];

    it('filters active projects properly', () => {
      const active = mockProjects.filter((p) => p.status === 'IN_PROGRESS');
      expect(active).toHaveLength(1);
      expect(active[0].projectCode).toBe('PRJ-101');
    });

    it('filters completed projects properly', () => {
      const completed = mockProjects.filter((p) => p.status === 'COMPLETED');
      expect(completed).toHaveLength(1);
      expect(completed[0].projectCode).toBe('PRJ-102');
    });

    it('matches search query across code and name', () => {
      const query = 'beta';
      const results = mockProjects.filter(
        (p) => p.name.toLowerCase().includes(query) || p.projectCode.toLowerCase().includes(query)
      );
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Beta Migration');
    });
  });

  describe('5. calculateClientTaskStats & Task Progress Calculations', () => {
    it('accurately computes task progress, completed vs remaining tasks, and attention required counts', () => {
      const projectTasks = [
        { id: 't1', title: 'Task 1', status: 'COMPLETED', priority: 'MEDIUM' },
        { id: 't2', title: 'Task 2', status: 'COMPLETED', priority: 'LOW' },
        { id: 't3', title: 'Task 3', status: 'IN_PROGRESS', priority: 'HIGH' },
        { id: 't4', title: 'Task 4', status: 'REVIEW', priority: 'URGENT' },
        { id: 't5', title: 'Task 5', status: 'TODO', priority: 'MEDIUM' },
      ];

      const stats = calculateClientTaskStats(
        { status: 'IN_PROGRESS' },
        mockMilestones,
        projectTasks
      );

      expect(stats.totalTasks).toBe(5);
      expect(stats.completedTasks).toBe(2);
      expect(stats.inProgressTasks).toBe(1);
      expect(stats.attentionRequiredTasks).toBe(1); // Task 4 has status REVIEW
      expect(stats.remainingTasks).toBe(3);
      expect(stats.completionPercentage).toBe(40); // 2 of 5 = 40%
    });

    it('handles client feedback label for action required detection', () => {
      const labeledTasks = [
        {
          id: 't-label',
          title: 'Provide Branding Feedback',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          labels: ['Client Feedback Required', 'Design'],
        },
      ];

      const sanitized = sanitizeClientTasks(labeledTasks);
      expect(sanitized[0].requiresClientAction).toBe(true);
    });

    it('detects overdue tasks accurately when due date is in the past', () => {
      const overdueTasks = [
        {
          id: 't-overdue',
          title: 'Overdue Task',
          status: 'IN_PROGRESS',
          priority: 'URGENT',
          dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        },
      ];

      const sanitized = sanitizeClientTasks(overdueTasks);
      expect(sanitized[0].isOverdue).toBe(true);
    });
  });
});
