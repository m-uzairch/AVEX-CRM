# Sprint 03 - Task 002

# Project Creation & Automation

Status: Not Started

Priority: Critical

Estimated Time: 12–16 Hours

---

# Objective

Build a complete Project Creation and Automation system for AVEX CRM.

This module should automatically create a project whenever a lead is successfully converted into a customer. Users should also be able to manually create projects.

The system must intelligently link Customers, Projects, Employees, Tasks (future), Invoices (future), Files (future), and the Client Portal (future), making the Project module the central hub of business operations.

---

# Requirements

Implement a complete Project Creation workflow.

The module must support:

- Automatic Project Creation
- Manual Project Creation
- Project Templates
- Team Assignment
- Project Manager Assignment
- Client Linking
- Project Code Generation
- Default Milestones
- Notifications
- Activity Logging

---

# Automatic Project Creation

When a Lead is converted into a Customer:

Automatically create a Project.

The workflow should be:

Lead

↓

Customer

↓

Project

↓

Notify Team

↓

Project Dashboard

No manual intervention should be required unless configured otherwise.

---

# Manual Project Creation

Allow administrators and authorized employees to manually create projects.

Create a "New Project" page.

Collect the following information.

---

# Basic Information

- Project Name
- Project Description
- Customer
- Company (Tenant)
- Category
- Priority
- Status

---

# Team Information

- Project Manager
- Team Members (Multiple Selection)

Display:

- Employee Avatar
- Name
- Role

Allow multiple employees to be assigned.

---

# Timeline

- Start Date
- Expected Completion Date

If no dates are provided, allow projects to remain unscheduled.

---

# Budget (Optional)

Allow entering:

- Estimated Budget
- Currency

Budget tracking will be expanded in future sprints.

---

# Business Type

Ask during project creation:

"What type of business is this project for?"

Options:

- Physical Business
- Digital Business

Based on the selection:

Automatically suggest the appropriate project category.

Examples:

Physical Business

- Restaurant
- Retail Store
- Construction
- Manufacturing
- Healthcare
- Education

Digital Business

- Website
- SaaS
- CRM
- Mobile App
- UI/UX
- Branding
- Digital Marketing
- SEO

Allow users to override the suggested category.

---

# Project Code

Automatically generate unique project codes.

Format:

AVX-0001

AVX-0002

AVX-0003

Project codes must remain unique within each company.

---

# Project Templates

Support predefined templates.

Examples:

Website Project

CRM Implementation

Mobile App

Brand Identity

Marketing Campaign

Software Development

Templates should automatically pre-fill:

- Category
- Default Status
- Default Priority
- Default Milestones
- Default Task Structure (Placeholder)

---

# Default Milestones

Automatically generate milestones when a project is created.

Example:

- Planning
- Design
- Development
- Testing
- Review
- Delivery

Users may edit or delete milestones.

Detailed milestone management will be completed in Task 007.

---

# Project Relationships

Every project must be linked with:

- Customer
- Company
- Project Manager
- Team Members

Future relationships:

- Tasks
- Invoices
- Files
- Meetings
- Client Portal

Prepare the database structure accordingly.

---

# Notifications

Automatically notify:

Project Manager

Assigned Employees

Customer (Future)

Notify when:

- Project Created
- Employee Assigned
- Manager Assigned

Use the notification system from Sprint 01.

---

# Activity Logging

Automatically record:

- Project Created
- Project Manager Assigned
- Employee Assigned
- Category Selected
- Status Updated
- Priority Updated

Display all activities in the Activity Timeline.

---

# Database

Extend the Project schema.

Include:

- Business Type
- Customer ID
- Company ID
- Project Manager ID
- Team Members
- Template ID
- Category ID
- Status
- Priority
- Project Code
- Budget
- Currency

Maintain full tenant isolation.

---

# API

Create secure API endpoints for:

- Create Project
- Auto Create Project
- Update Project
- Assign Manager
- Assign Employees
- Generate Project Code
- Fetch Templates

Validate all requests.

Return standardized API responses.

---

# Automation Rules

Implement the following automation:

Lead Converted

↓

Customer Created

↓

Project Created

↓

Generate Project Code

↓

Assign Manager

↓

Assign Team

↓

Create Default Milestones

↓

Create Activity Logs

↓

Send Notifications

↓

Redirect User to Project Dashboard

Each step should execute within a database transaction where appropriate to avoid partial failures.

---

# Error Handling

If any automation step fails:

- Roll back the transaction (where supported).
- Display a meaningful error.
- Log the failure.
- Do not create incomplete project records.

---

# Security

Ensure:

- Authentication required
- Tenant isolation
- Role-based authorization
- Input validation
- Secure automation workflow

Users must only create and manage projects belonging to their own company.

---

# UI

Create:

- New Project Page
- Project Creation Wizard
- Business Type Selector
- Customer Selector
- Team Assignment Component
- Template Selector
- Project Summary
- Success Screen
- Loading Skeletons
- Empty States

Use the AVEX CRM design system.

Keep the interface clean, modern, and professional with subtle hover effects and smooth loading animations.

---

# Responsive Design

Support:

- Desktop
- Tablet
- Mobile

Project creation should be fully usable on all devices.

---

# Performance

Optimize:

- Customer search
- Employee search
- Team selection
- Project creation workflow
- Database transactions

Ensure project creation remains fast even with large datasets.

---

# Constraints

Do not implement:

- Task Management
- Client Portal
- File Manager
- Meetings
- Time Tracking
- Project Reports

Only create the automation and project creation workflow.

---

# Deliverables

- Automatic Project Creation
- Manual Project Creation
- Project Templates
- Business Type Detection
- Automatic Category Suggestions
- Project Code Generator
- Team Assignment
- Project Manager Assignment
- Default Milestones
- Notifications
- Activity Logging
- Secure API Endpoints
- Database Integration

---

# Acceptance Criteria

- Projects can be created manually.
- Projects are automatically created when a lead is converted.
- Project codes are generated correctly.
- Business type suggestions work.
- Templates pre-fill project data.
- Default milestones are created.
- Team members can be assigned.
- Notifications are sent successfully.
- Activity logs are created.
- Multi-tenant isolation is enforced.
- Database transactions prevent partial project creation.
- No TypeScript errors.
- No ESLint errors.
- Application builds successfully.

---

# Definition of Done

This task is complete when AVEX CRM provides a production-ready Project Creation and Automation system that automatically transforms converted leads into structured projects, intelligently assigns teams, generates project metadata, creates default milestones, records activity, sends notifications, and securely integrates with the CRM's multi-tenant architecture.