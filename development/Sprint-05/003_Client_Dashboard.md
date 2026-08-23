# Sprint 05 - Task 003

# Client Dashboard

Status: Completed

Priority: High

---

# Objective

Build the main Client Portal dashboard where clients can quickly see the current status of their business relationship with AVEX CRM.

The dashboard should provide a simple overview of:

- Projects
- Quotations
- Invoices
- Meetings
- Requests

Use real data from the existing database.

---

# Requirements

Create the Client Portal dashboard at:

/portal

The dashboard should load data belonging only to the authenticated client.

---

# Dashboard Sections

Include the following summary cards:

### Active Projects

Display:

- Number of active projects
- Number of completed projects

---

### Pending Quotations

Display:

- Number of pending quotations
- Most recent quotation

---

### Outstanding Invoices

Display:

- Number of unpaid invoices
- Total outstanding amount

---

### Upcoming Meetings

Display:

- Next scheduled meeting
- Meeting date
- Meeting time

---

### Open Requests

Display:

- Number of active client requests
- Most recent request

---

# Recent Activity

Add a simple Recent Activity section.

Display recent client-related activity such as:

- Project updates
- New quotations
- New invoices
- Payment updates
- Request updates
- Meeting updates

Show:

- Activity title
- Short description
- Date/time

Use existing activity data where available.

---

# Active Projects Preview

Display a small list of the client's active projects.

Each project should show:

- Project name
- Status
- Progress
- Next step
- Last updated

Provide a link to:

/portal/projects/[id]

If there are no active projects, display an appropriate empty state.

---

# Financial Overview

Display a simple financial summary:

- Outstanding invoices
- Paid invoices
- Pending quotations

Do not introduce complex financial analytics in this task.

The detailed financial functionality will be handled in later tasks.

---

# API

Create or update the Client Portal dashboard API.

The API should return the data required by the dashboard.

Ensure the API:

- Authenticates the user.
- Verifies the client role.
- Resolves the client's customer/company.
- Only returns that client's data.
- Does not expose internal CRM information.

Avoid making unnecessary API requests.

Prefer retrieving related dashboard information efficiently.

---

# Loading States

Implement loading states for the dashboard.

Use:

- Skeleton cards
- Loading indicators
- Appropriate table/list placeholders

Do not leave the dashboard blank while data is loading.

---

# Empty States

Handle cases where the client has no:

- Projects
- Quotations
- Invoices
- Meetings
- Requests
- Recent activity

Show simple and understandable empty-state messages.

---

# Error Handling

If dashboard data cannot be loaded:

- Display a clear error message.
- Do not expose database or server errors.
- Provide a retry option where appropriate.

Do not silently display incorrect values.

---

# Responsive Design

Ensure the dashboard works correctly on:

- Desktop
- Tablet
- Mobile

Cards should stack appropriately on smaller screens.

Tables/lists should remain usable on mobile.

---

# UI

Keep the design consistent with the existing AVEX CRM UI.

Use:

- Existing components
- Existing typography
- Existing spacing
- Existing buttons
- Existing cards

Keep the dashboard clean and professional.

Do not add unnecessary animations or complex visualizations.

---

# Security

Verify every dashboard request server-side.

A client must not be able to manipulate:

- customerId
- companyId
- userId

to retrieve another client's information.

Use the authenticated session to determine ownership.

---

# Testing

Test:

1. Client logs in.
2. Client opens `/portal`.
3. Dashboard loads successfully.
4. Correct projects are displayed.
5. Correct quotation count is displayed.
6. Correct invoice information is displayed.
7. Correct meeting information is displayed.
8. Correct request information is displayed.
9. Recent activity belongs only to the client.
10. Client with no data receives proper empty states.
11. Unauthorized users cannot access dashboard data.
12. Dashboard works on mobile.

---

# Acceptance Criteria

- `/portal` displays the Client Dashboard.
- Dashboard uses real database data.
- All displayed information belongs to the authenticated client.
- Active projects are displayed correctly.
- Quotations are displayed correctly.
- Invoice summary is accurate.
- Upcoming meetings are displayed correctly.
- Open requests are displayed correctly.
- Recent activity is displayed correctly.
- Loading states work.
- Empty states work.
- Errors are handled properly.
- Dashboard is responsive.
- No existing CRM functionality is broken.
- No TypeScript errors.
- No console errors.
- Production build succeeds.

---

# Definition of Done

The Client Portal dashboard is fully functional and provides clients with a clear overview of their projects, financial documents, meetings, requests, and recent activity using secure, real database data.

Do not implement detailed project, invoice, quotation, meeting, or request functionality yet. Those will be implemented in the following Sprint 05 tasks.