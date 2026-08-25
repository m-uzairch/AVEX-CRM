# Sprint 06 - Task 002
# Calendar System

Status: Completed
Priority: High

---

# Objective

Complete and stabilize the AVEX CRM internal Calendar system.

The Calendar feature is currently incomplete from previous sprints.

Before implementing anything new, inspect the existing calendar implementation, database models, event APIs, meeting system, task system, project system, notification system, and existing Google Calendar integration.

The goal is to create one reliable internal calendar system that can display and manage CRM-related events.

DO NOT create a second calendar architecture if one already exists.

---

# IMPORTANT: AUDIT FIRST

Before making changes, inspect:

- Existing Calendar routes
- Existing Calendar components
- Existing event components
- Existing calendar APIs
- Existing Prisma models
- Existing Meeting model
- Existing Task model
- Existing Project model
- Existing notification system
- Existing Google Calendar code
- Existing Client Portal meeting/calendar functionality
- Existing timezone/date utilities
- Existing authentication/session system
- Existing RBAC system

Determine:

1. What already works.
2. What is incomplete.
3. What is broken.
4. What can be reused.
5. What needs to be fixed.

Do not rewrite working functionality unnecessarily.

---

# Calendar Route

The primary internal calendar should be available at:

/calendar

If a Calendar route already exists, repair and extend it rather than creating a duplicate route.

---

# Calendar Views

Support:

- Month View
- Week View
- Day View

If the existing calendar library already supports these views, reuse it.

The default view should follow the user's calendar preference from Settings.

---

# Calendar Events

Display relevant CRM events.

Events may originate from:

- Meetings
- Tasks
- Project milestones
- Client meetings
- Follow-up events
- Other existing CRM events

Do not duplicate the underlying records.

The calendar should reference the original entity where possible.

---

# Event Model

Before creating a new Event model, inspect the existing Prisma schema.

If a reusable event model already exists, use it.

If a new model is genuinely required, create a clean model capable of supporting:

- id
- companyId
- createdById
- title
- description
- eventType
- startTime
- endTime
- allDay
- location
- meetingUrl
- relatedEntityType
- relatedEntityId
- status
- createdAt
- updatedAt

Use the existing AVEX naming conventions.

Do not introduce duplicate IDs or relationships.

---

# Event Types

Support existing event types where possible.

Possible types:

- Meeting
- Task
- Project
- Follow-up
- Reminder
- Other

Do not create a second event-type system if one already exists.

---

# Create Event

Allow authorized users to create calendar events.

Fields:

- Title
- Description
- Event Type
- Start Date
- Start Time
- End Date
- End Time
- All Day
- Location
- Meeting Link
- Related Customer
- Related Project
- Related Task where applicable
- Reminder

Validation:

- Title required.
- Start time required unless all-day.
- End time must not occur before start time.
- Related entities must belong to the user's company.
- Meeting links must be valid where provided.

---

# Edit Event

Users should be able to edit events they are authorized to modify.

Allow:

- Title
- Description
- Date/time
- Location
- Meeting link
- Related project/customer
- Reminder
- Status

Do not allow unauthorized users to modify another company's events.

---

# Delete Event

Allow authorized users to delete events.

Before deleting:

- Verify ownership/company.
- Verify permissions.
- Prevent deletion of protected/system-generated records where applicable.

Use a confirmation dialog.

Do not silently delete events.

---

# Event Details

Clicking an event should display:

- Title
- Description
- Event type
- Date
- Time
- Location
- Meeting link
- Related customer
- Related project
- Related task
- Created by
- Status

Only show fields that actually exist.

Do not display internal data that the current user is not authorized to see.

---

# Meetings

Integrate existing CRM meetings with the calendar.

If a meeting already exists in the database:

Do not create another independent record just to display it on the calendar.

Instead, map the meeting into the calendar representation.

When a meeting is updated, the calendar should reflect the change.

When appropriate, calendar event details should link back to the original meeting.

---

# Tasks

Display task due dates/events where appropriate.

For example:

```text
Task: Complete Website Design
Due: August 24