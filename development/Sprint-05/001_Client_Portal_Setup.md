# Sprint 05 - Task 001

# Client Portal Setup

Status: Completed

Priority: High

---

# Objective

Create the basic foundation for the AVEX CRM Client Portal.

The Client Portal will provide customers with a separate area where they can view their projects, progress, quotations, invoices, meetings, files, and communication.

Keep the implementation simple and consistent with the existing AVEX CRM architecture.

---

# Requirements

Create the basic Client Portal structure.

The portal should have:

- Client Dashboard
- Projects
- Tasks & Progress
- Quotations
- Invoices
- Requests
- Meetings
- Files
- Communication
- Profile

---

# Portal Layout

Create a dedicated client-facing layout.

Include:

- Sidebar navigation
- Header
- User profile area
- Notifications
- Logout
- Responsive mobile navigation

The Client Portal should have a different navigation structure from the internal CRM dashboard.

---

# Client Access

Clients must only be able to access the Client Portal.

They must not have access to:

- Admin Dashboard
- Employee Dashboard
- CRM Management
- Financial Management
- Employee Management
- System Settings

---

# Client Data

The portal should use the existing CRM customer/company data.

A client should be associated with:

- User
- Customer
- Company
- Projects
- Quotations
- Invoices
- Meetings
- Files
- Requests

Do not create duplicate customer data if existing models can be reused.

---

# Routing

Create the basic client portal route structure.

Example:

/portal

/portal/projects

/portal/projects/[id]

/portal/quotations

/portal/invoices

/portal/requests

/portal/meetings

/portal/files

/portal/profile

---

# Authorization

Implement basic authorization for Client Portal routes.

Verify:

- User is authenticated
- User has client role
- User belongs to the correct customer/company
- Client can only access their own records

Never allow a client to access another company's data by changing an ID in the URL.

---

# Dashboard

Create the initial dashboard structure.

Display basic information such as:

- Active Projects
- Pending Quotations
- Outstanding Invoices
- Upcoming Meetings
- Recent Requests

Use existing data where available.

Do not create fake data for production functionality.

---

# UI

Keep the UI consistent with the existing AVEX CRM design.

Use:

- Simple layout
- Clean cards
- Consistent buttons
- Existing components
- Existing typography
- Existing spacing

Do not introduce unnecessary animations or complicated design.

---

# Responsive Design

The Client Portal should work on:

- Desktop
- Tablet
- Mobile

Ensure the sidebar/navigation works properly on smaller screens.

---

# API Structure

Create or prepare the API structure required by the Client Portal.

All Client Portal APIs must:

- Authenticate the user
- Verify client permissions
- Verify company/customer ownership
- Return only authorized data

Do not expose internal CRM data through client APIs.

---

# Error Handling

Handle:

- Unauthorized users
- Missing client profile
- Missing customer
- Missing company
- Missing project
- Invalid IDs
- API failures

Display simple user-friendly error messages.

---

# Deliverables

- Client Portal layout
- Client Portal navigation
- Client Portal routes
- Basic dashboard
- Client authorization
- Client/customer relationship
- Initial API structure
- Responsive design
- Basic error handling

---

# Acceptance Criteria

- Client can access `/portal`.
- Client sees the Client Portal dashboard.
- Client can navigate between portal sections.
- Client cannot access internal CRM pages.
- Client can only access their own company/customer data.
- Portal works on desktop and mobile.
- Existing AVEX CRM data is reused where appropriate.
- No existing CRM functionality is broken.
- No TypeScript errors.
- No console errors.
- Production build succeeds.

---

# Definition of Done

The Client Portal foundation is complete and ready for the next Sprint 05 tasks.

Do not implement advanced Client Portal functionality yet. Future tasks will implement Projects, Tasks, Quotations, Invoices, Requests, Meetings, Files, and Communication individually.
