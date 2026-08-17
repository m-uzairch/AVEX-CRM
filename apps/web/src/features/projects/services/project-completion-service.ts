/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/database/prisma';
import {
  ProjectCompletionValidation,
  ValidationRuleResult,
  ProjectDeliveryRecord,
  ProjectHistoryEvent,
  ProjectCompletionReport,
} from '../types/project-completion-types';

export class ProjectCompletionService {
  /**
   * Validate project completion criteria before delivery
   */
  static async validateCompletion(projectId: string): Promise<ProjectCompletionValidation> {
    const db = prisma as any;

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        tasks: true,
        milestones: true,
        files: true,
        members: { include: { user: true } },
        completionChecklist: true,
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const tasks = project.tasks || [];
    const milestones = project.milestones || [];
    const files = project.files || [];

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: any) => t.status === 'COMPLETED' || t.status === 'CANCELLED').length;
    const blockedTasks = tasks.filter((t: any) => t.status === 'BLOCKED').length;

    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter((m: any) => m.status === 'COMPLETED').length;

    // Evaluate validation rules
    const rules: ValidationRuleResult[] = [
      {
        id: 'rule_tasks',
        label: 'All Required Tasks Completed',
        category: 'TASKS',
        isPassed: totalTasks === 0 || completedTasks === totalTasks,
        message: totalTasks === 0 || completedTasks === totalTasks
          ? `All ${completedTasks}/${totalTasks} tasks are finished.`
          : `${totalTasks - completedTasks} pending task(s) remain incomplete.`,
        details: `Completed: ${completedTasks}, Total: ${totalTasks}`,
      },
      {
        id: 'rule_milestones',
        label: 'All Key Milestones Achieved',
        category: 'MILESTONES',
        isPassed: totalMilestones === 0 || completedMilestones === totalMilestones,
        message: totalMilestones === 0 || completedMilestones === totalMilestones
          ? `All ${completedMilestones}/${totalMilestones} milestones are complete.`
          : `${totalMilestones - completedMilestones} milestone(s) are still in progress or delayed.`,
        details: `Completed: ${completedMilestones}, Total: ${totalMilestones}`,
      },
      {
        id: 'rule_blocked_issues',
        label: 'No Critical Blocked Issues',
        category: 'ISSUES',
        isPassed: blockedTasks === 0,
        message: blockedTasks === 0
          ? 'No critical blocked tasks or unresolved issues.'
          : `Found ${blockedTasks} blocked task(s) requiring resolution.`,
      },
      {
        id: 'rule_deliverables',
        label: 'Final Deliverables & Documentation Uploaded',
        category: 'DELIVERABLES',
        isPassed: files.length > 0,
        message: files.length > 0
          ? `${files.length} project file(s)/document(s) uploaded.`
          : 'No deliverables or final documents uploaded yet.',
      },
      {
        id: 'rule_team',
        label: 'Team Members & Manager Assigned',
        category: 'TEAM',
        isPassed: !!project.projectManagerId && project.members.length > 0,
        message: !!project.projectManagerId && project.members.length > 0
          ? 'Project Manager and team members properly assigned.'
          : 'Missing assigned Project Manager or team members.',
      },
    ];

    const passedRulesCount = rules.filter((r) => r.isPassed).length;
    const totalRulesCount = rules.length;
    const isValid = passedRulesCount === totalRulesCount;

    // Format completion checklist
    const chk = project.completionChecklist || {
      allTasksCompleted: totalTasks > 0 && completedTasks === totalTasks,
      allMilestonesCompleted: totalMilestones > 0 && completedMilestones === totalMilestones,
      clientDeliverablesUploaded: files.length > 0,
      finalDocUploaded: files.length > 0,
      internalReviewCompleted: true,
      clientApprovalReceived: false,
    };

    return {
      isValid,
      canOverride: true,
      passedRulesCount,
      totalRulesCount,
      rules,
      checklist: chk,
    };
  }

  /**
   * Submit project delivery workflow
   */
  static async deliverProject(
    projectId: string,
    companyId: string = 'comp_001',
    deliveryData: {
      deliveredById: string;
      deliveryNotes?: string;
      deliveryFiles?: any[];
    }
  ): Promise<ProjectDeliveryRecord> {
    const db = prisma as any;

    // Check project
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { customer: true },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Create delivery record
    const delivery = await db.projectDelivery.create({
      data: {
        projectId,
        companyId,
        deliveredById: deliveryData.deliveredById,
        deliveryDate: new Date(),
        deliveryNotes: deliveryData.deliveryNotes || null,
        deliveryFiles: deliveryData.deliveryFiles || [],
        clientApprovalStatus: 'PENDING',
        deliveredAt: new Date(),
      },
      include: {
        deliveredBy: { select: { id: true, fullName: true, email: true, avatar: true } },
      },
    });

    // Update project status to REVIEW
    await db.project.update({
      where: { id: projectId },
      data: { status: 'REVIEW', updatedAt: new Date() },
    });

    // Record activity log
    try {
      await db.activityLog.create({
        data: {
          companyId,
          action: 'PROJECT_DELIVERED',
          module: 'PROJECTS',
          category: 'DELIVERY',
          entityType: 'PROJECT_DELIVERY',
          entityId: delivery.id,
          description: `Delivered project ${project.projectCode}: ${project.name} for client review`,
          metadata: { deliveryId: delivery.id, projectCode: project.projectCode },
        },
      });
    } catch {
      // Audit log fallback
    }

    return {
      id: delivery.id,
      projectId: delivery.projectId,
      companyId: delivery.companyId,
      deliveredById: delivery.deliveredById,
      deliveredByName: delivery.deliveredBy?.fullName,
      deliveredByEmail: delivery.deliveredBy?.email,
      deliveredByAvatar: delivery.deliveredBy?.avatar,
      deliveryDate: delivery.deliveryDate.toISOString(),
      deliveryNotes: delivery.deliveryNotes || undefined,
      deliveryFiles: delivery.deliveryFiles || [],
      clientApprovalStatus: delivery.clientApprovalStatus,
      deliveredAt: delivery.deliveredAt.toISOString(),
    };
  }

  /**
   * Process client approval or change request
   */
  static async submitClientApproval(
    projectId: string,
    companyId: string = 'comp_001',
    approvalData: {
      status: 'APPROVED' | 'CHANGES_REQUESTED';
      feedback?: string;
      changesNeeded?: string;
      userId?: string;
    }
  ) {
    const db = prisma as any;

    const delivery = await db.projectDelivery.findFirst({
      where: { projectId, companyId },
      orderBy: { createdAt: 'desc' },
    });

    if (!delivery) {
      throw new Error('Delivery record not found for this project.');
    }

    const now = new Date();

    // Create approval entry
    await db.deliveryApproval.create({
      data: {
        deliveryId: delivery.id,
        approvedById: approvalData.userId || null,
        status: approvalData.status,
        feedback: approvalData.feedback || null,
        changesNeeded: approvalData.changesNeeded || null,
      },
    });

    if (approvalData.status === 'APPROVED') {
      // Mark delivery & project as COMPLETED
      await db.projectDelivery.update({
        where: { id: delivery.id },
        data: {
          clientApprovalStatus: 'APPROVED',
          clientFeedback: approvalData.feedback || 'Delivery approved by client',
          approvedAt: now,
        },
      });

      await db.project.update({
        where: { id: projectId },
        data: {
          status: 'COMPLETED',
          actualCompletionDate: now,
          updatedAt: now,
        },
      });

      // Update completion checklist
      await db.completionChecklist.upsert({
        where: { projectId },
        update: { clientApprovalReceived: true, updatedAt: now },
        create: {
          projectId,
          companyId,
          allTasksCompleted: true,
          allMilestonesCompleted: true,
          clientDeliverablesUploaded: true,
          finalDocUploaded: true,
          internalReviewCompleted: true,
          clientApprovalReceived: true,
        },
      });

      // Log activity
      try {
        await db.activityLog.create({
          data: {
            companyId,
            action: 'CLIENT_APPROVAL_RECEIVED',
            module: 'PROJECTS',
            category: 'DELIVERY',
            entityType: 'PROJECT',
            entityId: projectId,
            description: 'Client approved project delivery and marked project completed.',
            metadata: { feedback: approvalData.feedback },
          },
        });
      } catch {
        // Log fallback
      }
    } else {
      // Changes Requested: reopen project (IN_PROGRESS)
      await db.projectDelivery.update({
        where: { id: delivery.id },
        data: {
          clientApprovalStatus: 'CHANGES_REQUESTED',
          requestedChangesNotes: approvalData.changesNeeded || approvalData.feedback,
          rejectedAt: now,
        },
      });

      await db.project.update({
        where: { id: projectId },
        data: {
          status: 'IN_PROGRESS',
          updatedAt: now,
        },
      });

      // Log activity
      try {
        await db.activityLog.create({
          data: {
            companyId,
            action: 'CHANGE_REQUEST_SUBMITTED',
            module: 'PROJECTS',
            category: 'DELIVERY',
            entityType: 'PROJECT',
            entityId: projectId,
            description: 'Client requested changes on project delivery. Project reopened to In Progress.',
            metadata: { changesNeeded: approvalData.changesNeeded },
          },
        });
      } catch {
        // Log fallback
      }
    }

    return { success: true, status: approvalData.status };
  }

  /**
   * Archive project
   */
  static async archiveProject(
    projectId: string,
    companyId: string = 'comp_001',
    archivedById: string,
    reason?: string
  ) {
    const db = prisma as any;

    await db.project.update({
      where: { id: projectId },
      data: { isArchived: true, updatedAt: new Date() },
    });

    // Record ArchiveRecord
    await db.archiveRecord.create({
      data: {
        projectId,
        companyId,
        archivedById,
        archivedAt: new Date(),
        reason: reason || 'Project completed and archived by manager',
      },
    });

    // Log activity
    try {
      await db.activityLog.create({
        data: {
          companyId,
          action: 'PROJECT_ARCHIVED',
          module: 'PROJECTS',
          category: 'PROJECT_MANAGEMENT',
          entityType: 'PROJECT',
          entityId: projectId,
          description: 'Project archived and moved to archive repository.',
          metadata: { reason },
        },
      });
    } catch {
      // Log fallback
    }

    return { success: true };
  }

  /**
   * Restore archived project
   */
  static async restoreProject(
    projectId: string,
    companyId: string = 'comp_001',
    restoredById: string
  ) {
    const db = prisma as any;

    await db.project.update({
      where: { id: projectId },
      data: { isArchived: false, updatedAt: new Date() },
    });

    // Update archive record
    const lastArchive = await db.archiveRecord.findFirst({
      where: { projectId, companyId },
      orderBy: { createdAt: 'desc' },
    });

    if (lastArchive) {
      await db.archiveRecord.update({
        where: { id: lastArchive.id },
        data: { restoredById, restoredAt: new Date() },
      });
    }

    // Log activity
    try {
      await db.activityLog.create({
        data: {
          companyId,
          action: 'PROJECT_RESTORED',
          module: 'PROJECTS',
          category: 'PROJECT_MANAGEMENT',
          entityType: 'PROJECT',
          entityId: projectId,
          description: 'Restored archived project back to active workspace.',
        },
      });
    } catch {
      // Log fallback
    }

    return { success: true };
  }

  /**
   * Generate final project completion report summary
   */
  static async getCompletionReport(projectId: string): Promise<ProjectCompletionReport> {
    const db = prisma as any;

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        customer: true,
        projectManager: true,
        members: { include: { user: true } },
        tasks: { include: { timeEntries: true } },
        milestones: true,
        deliveries: {
          orderBy: { createdAt: 'desc' },
          include: { deliveredBy: true },
        },
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    const start = project.startDate ? new Date(project.startDate) : new Date(project.createdAt);
    const end = project.actualCompletionDate ? new Date(project.actualCompletionDate) : new Date();
    const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));

    const tasks = project.tasks || [];
    const milestones = project.milestones || [];
    const completedTasks = tasks.filter((t: any) => t.status === 'COMPLETED').length;
    const completedMilestones = milestones.filter((m: any) => m.status === 'COMPLETED').length;

    let totalSeconds = 0;
    tasks.forEach((t: any) => {
      totalSeconds += t.totalTimeSpent || 0;
      (t.timeEntries || []).forEach((te: any) => {
        totalSeconds += te.durationSeconds || 0;
      });
    });
    const totalHoursLogged = Math.round((totalSeconds / 3600) * 10) / 10;

    const estimatedBudget = project.budget || 0;
    const budgetUsed = Math.min(estimatedBudget, Math.round(totalHoursLogged * 45));
    const budgetVariance = estimatedBudget > 0 ? Math.round(((estimatedBudget - budgetUsed) / estimatedBudget) * 100) : 0;

    const latestDelivery = project.deliveries?.[0];

    const teamPerformance = (project.members || []).map((m: any) => ({
      fullName: m.user?.fullName || 'Team Member',
      role: m.role || 'MEMBER',
      completedTasksCount: Math.round(completedTasks / Math.max(1, project.members.length)),
      hoursWorked: Math.round(totalHoursLogged / Math.max(1, project.members.length)),
    }));

    return {
      project: {
        id: project.id,
        projectCode: project.projectCode,
        name: project.name,
        status: project.status,
        priority: project.priority,
        customerName: project.customer?.name || project.customer?.companyName || 'N/A',
        customerEmail: project.customer?.email,
        projectManagerName: project.projectManager?.fullName || 'Unassigned',
        startDate: project.startDate ? project.startDate.toISOString().split('T')[0] : undefined,
        expectedCompletionDate: project.expectedCompletionDate ? project.expectedCompletionDate.toISOString().split('T')[0] : undefined,
        actualCompletionDate: project.actualCompletionDate ? project.actualCompletionDate.toISOString().split('T')[0] : undefined,
        durationDays,
      },
      summary: {
        totalTasks: tasks.length,
        completedTasks,
        totalMilestones: milestones.length,
        completedMilestones,
        totalHoursLogged,
        estimatedBudget,
        budgetUsed,
        budgetVariance,
        clientApprovalStatus: latestDelivery?.clientApprovalStatus || 'NOT_DELIVERED',
        deliveryDate: latestDelivery?.deliveryDate ? latestDelivery.deliveryDate.toISOString().split('T')[0] : undefined,
      },
      teamPerformance,
      deliveryDetails: latestDelivery
        ? {
            id: latestDelivery.id,
            projectId: latestDelivery.projectId,
            companyId: latestDelivery.companyId,
            deliveredById: latestDelivery.deliveredById,
            deliveredByName: latestDelivery.deliveredBy?.fullName,
            deliveredByEmail: latestDelivery.deliveredBy?.email,
            deliveryDate: latestDelivery.deliveryDate.toISOString(),
            deliveryNotes: latestDelivery.deliveryNotes || undefined,
            deliveryFiles: latestDelivery.deliveryFiles || [],
            clientApprovalStatus: latestDelivery.clientApprovalStatus,
            clientFeedback: latestDelivery.clientFeedback || undefined,
            deliveredAt: latestDelivery.deliveredAt.toISOString(),
          }
        : undefined,
    };
  }

  /**
   * Fetch permanent audit history timeline for project
   */
  static async getProjectHistory(projectId: string): Promise<ProjectHistoryEvent[]> {
    const db = prisma as any;

    const [project, activityLogs, deliveries, archiveRecords] = await Promise.all([
      db.project.findUnique({
        where: { id: projectId },
        include: {
          milestones: true,
          tasks: true,
          files: true,
        },
      }),
      db.activityLog.findMany({
        where: { entityId: projectId },
        orderBy: { timestamp: 'desc' },
        include: { user: true },
      }),
      db.projectDelivery.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        include: { deliveredBy: true },
      }),
      db.archiveRecord.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        include: { archivedBy: true, restoredBy: true },
      }),
    ]);

    if (!project) return [];

    const history: ProjectHistoryEvent[] = [];

    // 1. Creation event
    history.push({
      id: `hist_create_${project.id}`,
      timestamp: project.createdAt.toISOString(),
      category: 'CREATION',
      action: 'PROJECT_CREATED',
      title: 'Project Initialized',
      description: `Project ${project.projectCode}: ${project.name} created.`,
    });

    // 2. Activity logs
    activityLogs.forEach((log: any) => {
      history.push({
        id: `hist_act_${log.id}`,
        timestamp: log.timestamp.toISOString(),
        category: (log.category as any) || 'TASK',
        action: log.action,
        title: log.action.replace(/_/g, ' '),
        description: log.description,
        performedBy: log.user
          ? { id: log.user.id, fullName: log.user.fullName, avatar: log.user.avatar }
          : undefined,
      });
    });

    // 3. Deliveries & approvals
    deliveries.forEach((d: any) => {
      history.push({
        id: `hist_del_${d.id}`,
        timestamp: d.deliveredAt.toISOString(),
        category: 'DELIVERY',
        action: 'PROJECT_DELIVERED',
        title: 'Project Submitted for Review',
        description: d.deliveryNotes || 'Project deliverables submitted to client.',
        performedBy: d.deliveredBy
          ? { id: d.deliveredBy.id, fullName: d.deliveredBy.fullName, avatar: d.deliveredBy.avatar }
          : undefined,
      });
    });

    // 4. Archive events
    archiveRecords.forEach((a: any) => {
      history.push({
        id: `hist_arch_${a.id}`,
        timestamp: a.archivedAt.toISOString(),
        category: 'ARCHIVE',
        action: 'PROJECT_ARCHIVED',
        title: 'Project Archived',
        description: a.reason || 'Moved to project archives.',
        performedBy: a.archivedBy
          ? { id: a.archivedBy.id, fullName: a.archivedBy.fullName }
          : undefined,
      });

      if (a.restoredAt) {
        history.push({
          id: `hist_rest_${a.id}`,
          timestamp: a.restoredAt.toISOString(),
          category: 'ARCHIVE',
          action: 'PROJECT_RESTORED',
          title: 'Project Restored',
          description: 'Restored from archive back to active projects.',
          performedBy: a.restoredBy
            ? { id: a.restoredBy.id, fullName: a.restoredBy.fullName }
            : undefined,
        });
      }
    });

    // Sort timeline descending by timestamp
    return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Fetch list of archived projects for workspace
   */
  static async getArchivedProjects(companyId: string = 'comp_001') {
    const db = prisma as any;

    const projects = await db.project.findMany({
      where: { companyId, isArchived: true, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      include: {
        customer: true,
        projectManager: true,
        tasks: { select: { id: true, status: true } },
        milestones: { select: { id: true, status: true } },
      },
    });

    return projects.map((p: any) => {
      const totalTasks = p.tasks.length;
      const completedTasks = p.tasks.filter((t: any) => t.status === 'COMPLETED').length;
      const compPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

      return {
        id: p.id,
        projectCode: p.projectCode,
        name: p.name,
        customerName: p.customer?.name || p.customer?.companyName || 'N/A',
        projectManagerName: p.projectManager?.fullName || 'Unassigned',
        status: p.status,
        completionPercentage: compPct,
        archivedAt: p.updatedAt.toISOString().split('T')[0],
      };
    });
  }
}
