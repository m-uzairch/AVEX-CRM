# Sprint 01 - Task 006

# Database Schema & Core Models

Status: Not Started

Priority: Critical

Estimated Time: 10–14 Hours

---

# Objective

Design and implement the initial database schema for AVEX CRM using Prisma ORM.

This task establishes the core database structure required for authentication, multi-tenancy, user management, and future modules.

Focus on creating a scalable, normalized, and maintainable database.

---

# Requirements

Create the initial Prisma schema.

Generate the first database migration.

Generate the Prisma Client.

Ensure the database is ready for future modules.

---

# Core Models

Create the following models:

- Company
- User
- Role
- Permission
- UserRole
- UserProfile
- Invitation
- Session
- ActivityLog

Design relationships following best practices.

---

# Company

Store:

- Company Name
- Business Type
- Logo (optional)
- Timezone
- Currency
- Status
- Created At
- Updated At

Each company represents a tenant.

---

# User

Store:

- Supabase User ID
- Company ID
- Full Name
- Email
- Avatar
- Status
- Last Login
- Created At
- Updated At

Each user belongs to one company.

---

# User Profile

Store additional information:

- Phone
- Address
- Job Title
- Bio
- Profile Image

Keep profile information separate from authentication data.

---

# Role

Create system roles:

- Company Owner
- Admin
- Employee
- Client

Design the model so custom roles can be added later.

---

# Permission

Create a reusable permission model.

Permissions should not be hardcoded into the database structure.

Design for future scalability.

---

# UserRole

Create a relationship between users and roles.

Support future multiple-role assignments if required.

---

# Invitation

Store:

- Email
- Role
- Company
- Invitation Token
- Expiration Date
- Invitation Status
- Created By
- Created At

---

# Session

Store session metadata if required by the application.

Include:

- User
- Device Information
- Last Activity
- Login Time

---

# Activity Log

Store:

- User
- Company
- Action
- Module
- Description
- Timestamp

This table will be expanded in future tasks.

---

# Relationships

Implement proper relationships between all models.

Use:

- Foreign Keys
- Cascade Rules where appropriate
- Indexes
- Unique Constraints

Avoid duplicate data.

---

# Prisma

Requirements:

- Generate Prisma Client
- Generate Initial Migration
- Verify Schema
- Apply Migration Successfully

---

# Seed Data

Create basic seed data.

Include:

- Default Roles
- Default Permissions
- Sample Company (Development Only)
- Sample Admin User (Development Only)

Seeding should be optional and easy to reset.

---

# Validation

Ensure:

- Required fields
- Unique email
- Unique company ownership
- Proper foreign key constraints

---

# Performance

Add indexes where appropriate.

Optimize relationships for future scalability.

---

# Error Handling

Handle:

- Migration failures
- Seed failures
- Duplicate records
- Invalid relationships

---

# Documentation

Document each model using Prisma comments.

Use clear naming conventions.

---

# Constraints

Do not implement:

- CRM
- Customers
- Leads
- Projects
- Attendance
- Inventory
- Invoices
- Reports
- Notifications
- AI Features

Only create the database foundation.

---

# Deliverables

- Complete Prisma Schema
- Initial Migration
- Prisma Client
- Seed Script
- Core Database Models
- Relationships
- Indexes
- Constraints

---

# Acceptance Criteria

- Prisma schema validates successfully.
- Migration runs without errors.
- Prisma Client generates successfully.
- Seed script works.
- Relationships are correct.
- No duplicate data.
- No TypeScript errors.
- No ESLint errors.

---

# Definition of Done

This task is complete when AVEX CRM has a production-ready core database schema that supports authentication, multi-tenancy, user management, and provides a solid foundation for all future modules.