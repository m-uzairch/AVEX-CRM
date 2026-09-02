/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from '@/lib/database/prisma';
import { Prisma } from '@prisma/client';
import {
  EmployeeRecord,
  EmployeeFilterParams,
  EmployeeDetailResponse,
  EmploymentStatus,
} from '../types/employee-types';
import {
  EmployeeCreateInput,
  EmployeeUpdateInput,
} from '../schemas/employee-schemas';
import { memoryAttendanceRecords } from '@/features/attendance/services/attendance-store';
import { memoryEmployeeRecords } from './employee-store';
import { AuthUserStore } from '@/features/auth/services/auth-user-store';

export class EmployeeService {
  /**
   * Fetch company-scoped paginated and filtered employees list
   */
  static async getEmployees(
    companyId: string,
    params: EmployeeFilterParams = {}
  ): Promise<{
    data: EmployeeRecord[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.max(1, Math.min(100, params.pageSize || 10));
    const search = params.search?.trim().toLowerCase();
    const department = params.department;
    const status = params.status;
    const sortField = params.sortField || 'createdAt';
    const sortOrder = params.sortOrder || 'desc';

    const where: Prisma.EmployeeWhereInput = {
      companyId,
    };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { role: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (department && department !== 'ALL') {
      where.department = department;
    }

    if (status && status !== 'ALL') {
      where.employmentStatus = status as any;
    }

    try {
      const [employees, total] = await Promise.all([
        prisma.employee.findMany({
          where,
          orderBy: { [sortField]: sortOrder },
          skip: (page - 1) * pageSize,
          take: pageSize,
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatar: true,
                status: true,
              },
            },
          },
        }),
        prisma.employee.count({ where }),
      ]);

      const totalPages = Math.ceil(total / pageSize) || 1;

      return {
        data: employees.map((emp) => ({
          id: emp.id,
          companyId: emp.companyId,
          userId: emp.userId,
          fullName: emp.fullName,
          email: emp.email,
          phone: emp.phone,
          role: emp.role,
          department: emp.department,
          employmentStatus: emp.employmentStatus as EmploymentStatus,
          hireDate: emp.hireDate ? emp.hireDate.toISOString() : null,
          terminationDate: emp.terminationDate ? emp.terminationDate.toISOString() : null,
          avatarUrl: emp.avatarUrl,
          createdAt: emp.createdAt.toISOString(),
          updatedAt: emp.updatedAt.toISOString(),
          user: emp.user
            ? {
                id: emp.user.id,
                fullName: emp.user.fullName,
                email: emp.user.email,
                avatar: emp.user.avatar,
                status: emp.user.status,
              }
            : null,
        })),
        total,
        page,
        pageSize,
        totalPages,
      };
    } catch (dbError: any) {
      console.warn(
        '[EmployeeService.getEmployees] Database connection unavailable, falling back to resilient development store:',
        dbError?.message || dbError
      );

      // Resilient development store fallback
      let list = memoryEmployeeRecords[companyId] || memoryEmployeeRecords.comp_001 || [];

      if (search) {
        list = list.filter(
          (e) =>
            e.fullName.toLowerCase().includes(search) ||
            e.email.toLowerCase().includes(search) ||
            e.role.toLowerCase().includes(search)
        );
      }

      if (department && department !== 'ALL') {
        list = list.filter((e) => e.department === department);
      }

      if (status && status !== 'ALL') {
        list = list.filter((e) => e.employmentStatus === status);
      }

      const total = list.length;
      const totalPages = Math.ceil(total / pageSize) || 1;
      const paginated = list.slice((page - 1) * pageSize, page * pageSize);

      return {
        data: paginated,
        total,
        page,
        pageSize,
        totalPages,
      };
    }
  }

  /**
   * Fetch a single employee by ID within the company, including assigned tasks & attendance summary
   */
  static async getEmployeeById(
    companyId: string,
    id: string
  ): Promise<EmployeeDetailResponse | null> {
    let employee: any = null;
    let assignedTasks: any[] = [];

    try {
      employee = await prisma.employee.findFirst({
        where: {
          id,
          companyId,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatar: true,
              status: true,
            },
          },
        },
      });

      if (employee?.userId) {
        assignedTasks = await prisma.task.findMany({
          where: {
            companyId,
            deletedAt: null,
            assignees: {
              some: {
                userId: employee.userId,
              },
            },
          },
          orderBy: { dueDate: 'asc' },
          take: 10,
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
            dueDate: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
      }
    } catch (dbError: any) {
      console.warn(
        '[EmployeeService.getEmployeeById] DB unavailable, using memory store:',
        dbError?.message
      );
      const list = memoryEmployeeRecords[companyId] || memoryEmployeeRecords.comp_001 || [];
      employee = list.find((e) => e.id === id) || null;
    }

    if (!employee) {
      return null;
    }

    // Attendance summary from company attendance store
    const companyAttendance =
      memoryAttendanceRecords[companyId] || memoryAttendanceRecords.comp_001 || [];
    const empAttendance = companyAttendance.filter(
      (r) =>
        r.companyId === companyId &&
        (r.userId === employee.userId ||
          r.employeeEmail.toLowerCase() === employee.email.toLowerCase() ||
          r.employeeName.toLowerCase() === employee.fullName.toLowerCase())
    );

    const presentDays = empAttendance.filter((r) => r.status === 'PRESENT').length;
    const lateDays = empAttendance.filter((r) => r.status === 'LATE').length;
    const halfDays = empAttendance.filter((r) => r.status === 'HALF_DAY').length;
    const totalWorkingMinutes = empAttendance.reduce(
      (acc, r) => acc + (r.workingMinutes || 0),
      0
    );
    const totalWorkingHours = Math.round((totalWorkingMinutes / 60) * 10) / 10;

    const recentRecords = empAttendance
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map((r) => ({
        id: r.id,
        date: r.date,
        clockIn: r.clockIn,
        clockOut: r.clockOut,
        status: r.status,
        workingMinutes: r.workingMinutes,
      }));

    return {
      employee: {
        id: employee.id,
        companyId: employee.companyId,
        userId: employee.userId,
        fullName: employee.fullName,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        department: employee.department,
        employmentStatus: employee.employmentStatus as EmploymentStatus,
        hireDate: employee.hireDate
          ? typeof employee.hireDate === 'string'
            ? employee.hireDate
            : employee.hireDate.toISOString()
          : null,
        terminationDate: employee.terminationDate
          ? typeof employee.terminationDate === 'string'
            ? employee.terminationDate
            : employee.terminationDate.toISOString()
          : null,
        avatarUrl: employee.avatarUrl,
        createdAt:
          typeof employee.createdAt === 'string'
            ? employee.createdAt
            : employee.createdAt.toISOString(),
        updatedAt:
          typeof employee.updatedAt === 'string'
            ? employee.updatedAt
            : employee.updatedAt.toISOString(),
        user: employee.user
          ? {
              id: employee.user.id,
              fullName: employee.user.fullName,
              email: employee.user.email,
              avatar: employee.user.avatar,
              status: employee.user.status,
            }
          : null,
      },
      assignedTasks: assignedTasks.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate ? (typeof t.dueDate === 'string' ? t.dueDate : t.dueDate.toISOString()) : null,
        project: t.project,
      })),
      attendanceSummary: {
        totalDays: empAttendance.length,
        presentDays,
        lateDays,
        halfDays,
        totalWorkingHours,
        recentRecords,
      },
    };
  }

  /**
   * Create a new employee record directly returning the created entity
   */
  static async createEmployee(
    companyId: string,
    data: EmployeeCreateInput
  ): Promise<EmployeeRecord> {
    try {
      const created = await prisma.employee.create({
        data: {
          companyId,
          userId: data.userId || null,
          fullName: data.fullName,
          email: data.email.toLowerCase().trim(),
          phone: data.phone || null,
          role: data.role,
          department: data.department || null,
          employmentStatus: (data.employmentStatus as any) || 'ACTIVE',
          hireDate: data.hireDate ? new Date(data.hireDate) : null,
          terminationDate: data.terminationDate ? new Date(data.terminationDate) : null,
          avatarUrl: data.avatarUrl || null,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatar: true,
              status: true,
            },
          },
        },
      });

      const result: EmployeeRecord = {
        id: created.id,
        companyId: created.companyId,
        userId: created.userId,
        fullName: created.fullName,
        email: created.email,
        phone: created.phone,
        role: created.role,
        department: created.department,
        employmentStatus: created.employmentStatus as EmploymentStatus,
        hireDate: created.hireDate ? created.hireDate.toISOString() : null,
        terminationDate: created.terminationDate
          ? created.terminationDate.toISOString()
          : null,
        avatarUrl: created.avatarUrl,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
        user: created.user,
      };

      // Also register credentials in AuthUserStore for authentication
      AuthUserStore.registerOrUpdateUser({
        id: created.userId || created.id,
        email: data.email.toLowerCase().trim(),
        password: 'Password123!',
        fullName: data.fullName,
        role: 'EMPLOYEE',
        companyId,
        companyName: 'AVEX CRM Technologies Inc.',
        businessType: 'DIGITAL',
        status: 'ACTIVE',
        isEmailVerified: true,
        createdAt: created.createdAt.toISOString(),
      });

      return result;
    } catch (dbError: any) {
      console.warn(
        '[EmployeeService.createEmployee] DB insert failed, storing in development store:',
        dbError?.message
      );

      if (!memoryEmployeeRecords[companyId]) {
        memoryEmployeeRecords[companyId] = [];
      }

      const newRecord: EmployeeRecord = {
        id: `emp_${Date.now()}`,
        companyId,
        userId: data.userId || null,
        fullName: data.fullName,
        email: data.email.toLowerCase().trim(),
        phone: data.phone || null,
        role: data.role,
        department: data.department || null,
        employmentStatus: data.employmentStatus || 'ACTIVE',
        hireDate: data.hireDate || new Date().toISOString(),
        terminationDate: data.terminationDate || null,
        avatarUrl: data.avatarUrl || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: null,
      };

      memoryEmployeeRecords[companyId].unshift(newRecord);

      // Register credentials in AuthUserStore for authentication
      AuthUserStore.registerOrUpdateUser({
        id: newRecord.userId || newRecord.id,
        email: data.email.toLowerCase().trim(),
        password: 'Password123!',
        fullName: data.fullName,
        role: 'EMPLOYEE',
        companyId,
        companyName: 'AVEX CRM Technologies Inc.',
        businessType: 'DIGITAL',
        status: 'ACTIVE',
        isEmailVerified: true,
        createdAt: newRecord.createdAt,
      });

      return newRecord;
    }
  }

  /**
   * Update an employee record directly returning the updated entity
   */
  static async updateEmployee(
    companyId: string,
    id: string,
    data: EmployeeUpdateInput
  ): Promise<EmployeeRecord> {
    try {
      const updateData: Prisma.EmployeeUpdateInput = {};

      if (data.fullName !== undefined) updateData.fullName = data.fullName;
      if (data.email !== undefined) updateData.email = data.email.toLowerCase().trim();
      if (data.phone !== undefined) updateData.phone = data.phone || null;
      if (data.role !== undefined) updateData.role = data.role;
      if (data.department !== undefined) updateData.department = data.department || null;
      if (data.employmentStatus !== undefined)
        updateData.employmentStatus = data.employmentStatus as any;
      if (data.hireDate !== undefined)
        updateData.hireDate = data.hireDate ? new Date(data.hireDate) : null;
      if (data.terminationDate !== undefined)
        updateData.terminationDate = data.terminationDate
          ? new Date(data.terminationDate)
          : null;
      if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl || null;
      if (data.userId !== undefined) {
        if (data.userId) {
          updateData.user = { connect: { id: data.userId } };
        } else {
          updateData.user = { disconnect: true };
        }
      }

      const updated = await prisma.employee.update({
        where: {
          id_companyId: {
            id,
            companyId,
          },
        },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatar: true,
              status: true,
            },
          },
        },
      });

      return {
        id: updated.id,
        companyId: updated.companyId,
        userId: updated.userId,
        fullName: updated.fullName,
        email: updated.email,
        phone: updated.phone,
        role: updated.role,
        department: updated.department,
        employmentStatus: updated.employmentStatus as EmploymentStatus,
        hireDate: updated.hireDate ? updated.hireDate.toISOString() : null,
        terminationDate: updated.terminationDate
          ? updated.terminationDate.toISOString()
          : null,
        avatarUrl: updated.avatarUrl,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        user: updated.user,
      };
    } catch (dbError: any) {
      console.warn(
        '[EmployeeService.updateEmployee] DB update failed, updating in development store:',
        dbError?.message
      );

      const list = memoryEmployeeRecords[companyId] || memoryEmployeeRecords.comp_001 || [];
      const item = list.find((e) => e.id === id);
      if (!item) {
        throw new Error('Employee not found in development store.');
      }

      if (data.fullName !== undefined) item.fullName = data.fullName;
      if (data.email !== undefined) item.email = data.email.toLowerCase().trim();
      if (data.phone !== undefined) item.phone = data.phone || null;
      if (data.role !== undefined) item.role = data.role;
      if (data.department !== undefined) item.department = data.department || null;
      if (data.employmentStatus !== undefined) item.employmentStatus = data.employmentStatus;
      if (data.hireDate !== undefined) item.hireDate = data.hireDate || null;
      if (data.terminationDate !== undefined) item.terminationDate = data.terminationDate || null;
      if (data.avatarUrl !== undefined) item.avatarUrl = data.avatarUrl || null;
      item.updatedAt = new Date().toISOString();

      return item;
    }
  }

  /**
   * Soft deactivate or reactivate an employee via employmentStatus
   */
  static async updateEmployeeStatus(
    companyId: string,
    id: string,
    status: EmploymentStatus
  ): Promise<EmployeeRecord> {
    try {
      const updated = await prisma.employee.update({
        where: {
          id_companyId: {
            id,
            companyId,
          },
        },
        data: {
          employmentStatus: status as any,
          terminationDate: status === 'TERMINATED' ? new Date() : null,
        },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              avatar: true,
              status: true,
            },
          },
        },
      });

      return {
        id: updated.id,
        companyId: updated.companyId,
        userId: updated.userId,
        fullName: updated.fullName,
        email: updated.email,
        phone: updated.phone,
        role: updated.role,
        department: updated.department,
        employmentStatus: updated.employmentStatus as EmploymentStatus,
        hireDate: updated.hireDate ? updated.hireDate.toISOString() : null,
        terminationDate: updated.terminationDate
          ? updated.terminationDate.toISOString()
          : null,
        avatarUrl: updated.avatarUrl,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        user: updated.user,
      };
    } catch (dbError: any) {
      console.warn(
        '[EmployeeService.updateEmployeeStatus] DB update failed, updating in development store:',
        dbError?.message
      );

      const list = memoryEmployeeRecords[companyId] || memoryEmployeeRecords.comp_001 || [];
      const item = list.find((e) => e.id === id);
      if (!item) {
        throw new Error('Employee not found in development store.');
      }

      item.employmentStatus = status;
      item.terminationDate = status === 'TERMINATED' ? new Date().toISOString() : null;
      item.updatedAt = new Date().toISOString();

      return item;
    }
  }
}
