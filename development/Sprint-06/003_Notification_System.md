# Sprint 06 - Task 003
# Notification System

Status: Completed
Priority: High

---

# Objective

Complete and stabilize the AVEX CRM notification system.

The notification functionality is currently incomplete from previous sprints.

Before implementing anything new, audit the existing notification provider, notification components, database models, API routes, toast provider, email integration, user preferences, and existing notification triggers.

The goal is to create one centralized notification system that can support:

- In-app notifications
- Email notifications
- Calendar reminders
- CRM activity notifications
- Client Portal notifications
- Employee notifications

DO NOT create multiple independent notification systems.

---

# IMPORTANT: AUDIT FIRST

Before making changes, inspect:

- Existing notification components
- Existing notification provider
- Existing toast provider
- Existing notification API routes
- Existing Prisma notification models
- Existing user preferences
- Existing Settings implementation
- Existing Resend integration
- Existing Calendar implementation
- Existing Client Portal notification functionality
- Existing authentication/session system
- Existing RBAC system
- Existing background job system
- Existing notification templates

Determine:

1. What already works.
2. What is incomplete.
3. What is broken.
4. What can be reused.
5. What needs to be fixed.

Do not rewrite working functionality unnecessarily.

---

# Notification Architecture

There should be one centralized notification service.

Conceptually:

Event
  ↓
Notification Service
  ↓
Preference Check
  ↓
Create In-App Notification
  ↓
Optional Email Notification
  ↓
Optional Toast/Realtime Update

The business features should not each implement their own notification logic.

---

# Notification Model

Inspect the existing Prisma schema before creating anything.

If an appropriate Notification model already exists, reuse it.

If one is missing, create a reusable model containing appropriate fields such as:

- id
- companyId
- userId
- type
- title
- message
- link
- entityType
- entityId
- readAt
- createdAt

Use the existing AVEX naming conventions.

Do not create duplicate notification tables.

---

# Notification Types

Create/reuse a centralized notification type system.

Support relevant existing AVEX events such as:

- LEAD_CREATED
- LEAD_ASSIGNED
- CUSTOMER_CREATED
- CUSTOMER_UPDATED
- TASK_ASSIGNED
- TASK_DUE
- PROJECT_UPDATED
- PROJECT_STATUS_CHANGED
- INVOICE_CREATED
- INVOICE_DUE
- PAYMENT_RECEIVED
- QUOTATION_CREATED
- QUOTATION_ACCEPTED
- QUOTATION_REJECTED
- CLIENT_REQUEST_CREATED
- CLIENT_MESSAGE_RECEIVED
- MEETING_CREATED
- MEETING_UPDATED
- MEETING_REMINDER
- ATTENDANCE_REMINDER
- ATTENDANCE_UPDATED

Only implement event types that correspond to actual existing functionality.

Do not create fake triggers.

---

# Notification Center

Provide a central notification interface.

The user should be able to:

- View notifications
- See unread notifications
- Open a notification
- Mark notification as read
- Mark notification as unread where appropriate
- Mark all notifications as read
- Navigate to the related entity

Example:

```text
Notifications

● New lead assigned to you
  Acme Corporation
  5 minutes ago

● Invoice payment received
  INV-1042
  1 hour ago

○ Meeting tomorrow
  Client Meeting
  Yesterday