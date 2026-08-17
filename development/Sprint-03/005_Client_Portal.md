# Sprint 03 - Task 005

# Client Portal

Status: Not Started

Priority: Critical

Estimated Time: 14–18 Hours

---

# Objective

Build a secure Client Portal for AVEX CRM.

The Client Portal will allow clients to securely log in and monitor the progress of their projects without accessing internal company data. Clients should be able to view project status, milestones, invoices, payment tracking, files, meetings, and communicate with the company through a dedicated portal.

The portal must be fully isolated from the internal employee dashboard.

---

# Requirements

Implement a complete Client Portal.

The module must support:

- Client Authentication
- Client Dashboard
- Project Tracking
- Milestones
- Task Progress (Read Only)
- Payment Tracking
- File Downloads
- Meeting Schedule
- Change Requests
- Messaging
- Notifications
- Activity Timeline

---

# Client Authentication

Clients should receive their own login credentials.

Support:

- Email + Password
- Forgot Password
- Reset Password
- Secure Session Management

Clients must never access employee or admin routes.

---

# Client Dashboard

Create a dedicated dashboard.

Display:

- Welcome Card
- Active Projects
- Completed Projects
- Pending Payments
- Upcoming Meetings
- Recent Notifications
- Recent Activity

Display only projects belonging to the logged-in client.

---

# Project Overview

Clients should be able to view:

- Project Name
- Project Code
- Current Status
- Project Manager
- Team Members
- Start Date
- Expected Completion Date
- Completion Percentage
- Current Phase

The project must be read-only.

---

# Project Timeline

Display:

- Planning
- Design
- Development
- Testing
- Review
- Delivery

Highlight:

- Completed
- Current
- Upcoming

Automatically update as project status changes.

---

# Milestones

Display:

- Milestone Name
- Status
- Due Date
- Completion Date

Clients should not edit milestones.

---

# Task Progress

Display project task progress.

Show:

- Total Tasks
- Completed Tasks
- Remaining Tasks
- Completion Percentage

Do not expose internal employee comments or private task details.

---

# Payment Tracking

Display payment information.

Include:

- Total Project Cost
- Amount Paid
- Remaining Balance
- Next Payment Due Date
- Payment Status

Statuses:

- Paid
- Pending
- Overdue

Clients cannot make payments through the portal.

Payment processing will be implemented in future sprints.

---

# Files

Allow clients to:

- View Files
- Download Files

Supported formats:

- PDF
- DOCX
- XLSX
- PNG
- JPG
- ZIP

Only files marked as client-visible should appear.

---

# Change Requests

Allow clients to submit change requests.

Each request should include:

- Title
- Description
- Priority
- Attachment (Optional)

Statuses:

- Submitted
- Under Review
- Approved
- Rejected
- Completed

Notify the project manager when a request is submitted.

---

# Meetings

Display scheduled meetings.

Include:

- Date
- Time
- Meeting Type
- Meeting Link
- Notes (Client Visible)

Future integration:

- Google Calendar
- Google Meet
- Zoom

---

# Messaging

Provide a secure messaging system.

Clients should be able to:

- Send Messages
- Receive Replies
- View Conversation History

Support:

- Attachments
- Read Status
- Timestamps

Messages should remain within the project.

---

# Notifications

Display notifications for:

- Project Status Updated
- Milestone Completed
- Meeting Scheduled
- New File Uploaded
- Change Request Updated
- New Message
- Payment Due Reminder

Reuse the notification system built in Sprint 01.

---

# Activity Timeline

Display client-visible activities only.

Examples:

- Project Created
- Milestone Completed
- File Uploaded
- Meeting Scheduled
- Status Updated

Never display internal employee activities.

---

# Client Profile

Allow clients to manage:

- Name
- Company
- Phone
- Email
- Password
- Profile Picture

Company information should remain read-only.

---

# Search

Support searching within:

- Projects
- Files
- Messages
- Change Requests

---

# Database

Create models for:

- Client Accounts
- Client Sessions
- Change Requests
- Client Messages

Extend existing relationships:

Company

↓

Customer

↓

Projects

↓

Client Portal

Maintain complete tenant isolation.

---

# API

Create secure API endpoints for:

- Client Login
- Client Dashboard
- Project Details
- File Downloads
- Change Requests CRUD
- Client Messages
- Notifications
- Profile Management

Validate every request.

Return standardized API responses.

---

# Security

Ensure:

- Authentication required
- Tenant isolation
- Client-only permissions
- Secure file downloads
- Input validation
- Session protection

Clients must never access:

- Employee Dashboard
- CRM
- Internal Notes
- Employee Tasks
- Attendance
- Financial Reports
- Internal Messages

---

# Performance

Optimize:

- Dashboard Loading
- File Downloads
- Message Loading
- Notification Updates

Use pagination and lazy loading where appropriate.

---

# UI

Create:

- Client Login
- Client Dashboard
- Project Overview
- Timeline
- Milestones
- Payment Tracking
- File Manager
- Messaging
- Change Requests
- Notifications
- Profile Page
- Loading Skeletons
- Empty States

Follow the AVEX CRM design system.

Maintain a clean, minimal, professional interface with subtle hover effects and smooth loading animations.

Avoid flashy UI.

---

# Responsive Design

Support:

- Desktop
- Tablet
- Mobile

The client portal should remain fully functional on all screen sizes.

---

# Error Handling

Handle:

- Unauthorized Access
- Project Not Found
- File Download Errors
- Messaging Errors
- Change Request Errors
- Network Errors
- Validation Errors

Display clear, user-friendly error messages.

---

# Constraints

Do not implement:

- Online Payments
- Live Chat
- Video Calling
- AI Chatbot
- Project Editing
- Invoice Generation
- Electronic Signatures

Clients should only be able to view project information and communicate with the company.

---

# Deliverables

- Client Authentication
- Client Dashboard
- Project Overview
- Timeline
- Milestones
- Task Progress
- Payment Tracking
- File Downloads
- Change Requests
- Messaging System
- Notifications
- Activity Timeline
- Profile Management
- Secure API Endpoints
- Database Integration

---

# Acceptance Criteria

- Clients can log in securely.
- Clients only see their own projects.
- Project progress updates correctly.
- Milestones display accurately.
- Payment tracking works.
- Files can be downloaded.
- Change requests can be submitted.
- Messaging works correctly.
- Notifications are delivered.
- Internal company data remains hidden.
- Tenant isolation is enforced.
- No TypeScript errors.
- No ESLint errors.
- Application builds successfully.

---

# Definition of Done

This task is complete when AVEX CRM provides a secure, production-ready Client Portal that allows clients to monitor their projects, milestones, payment status, meetings, files, and communications while maintaining strict separation from internal company operations through role-based access control and multi-tenant security.