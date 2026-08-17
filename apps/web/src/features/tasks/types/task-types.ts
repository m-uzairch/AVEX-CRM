export type TaskStatus =
  | 'TODO'
  | 'IN_PROGRESS'
  | 'REVIEW'
  | 'BLOCKED'
  | 'COMPLETED'
  | 'CANCELLED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TaskViewMode = 'kanban' | 'list' | 'calendar';

export interface TaskAssignee {
  id: string;
  taskId: string;
  userId: string;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string | null;
  };
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  assigneeId?: string | null;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  companyId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    avatar?: string | null;
  };
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedById: string;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  startTime: string;
  endTime?: string | null;
  durationSeconds: number;
  createdAt: string;
}

export interface TaskDependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  dependsOn?: {
    id: string;
    title: string;
    status: TaskStatus;
  };
}

export interface Task {
  id: string;
  companyId: string;
  projectId: string;
  customerId?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  estimatedHours?: number | null;
  totalTimeSpent: number; // In seconds
  labels: string[];
  tags: string[];
  createdById?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;

  // Relations
  project?: {
    id: string;
    projectCode: string;
    name: string;
  } | null;
  customer?: {
    id: string;
    name: string;
    companyName: string;
  } | null;
  createdBy?: {
    id: string;
    fullName: string;
  } | null;
  assignees?: TaskAssignee[];
  subtasks?: Subtask[];
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
  timeEntries?: TimeEntry[];
  dependencies?: TaskDependency[];
}

export interface TaskFilterParams {
  projectId?: string;
  customerId?: string;
  assigneeId?: string;
  status?: TaskStatus | 'ALL';
  priority?: TaskPriority | 'ALL';
  search?: string;
  page?: number;
  pageSize?: number;
  sortField?: 'title' | 'dueDate' | 'priority' | 'status' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedTasksResponse {
  data: Task[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
