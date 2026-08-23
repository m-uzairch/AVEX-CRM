# Sprint 05 - Task 007

# Client Requests & Change Requests

Status: Completed

Priority: High

---

# Objective

Allow clients to submit requests and request changes related to their projects through the Client Portal.

Clients should be able to communicate what they need changed or updated without accessing the internal CRM.

---

# Requirements

Create:

/portal/requests

/portal/requests/new

/portal/requests/[id]

---

# Requests List

The `/portal/requests` page should display requests submitted by the authenticated client.

Each request should show:

- Request Title
- Related Project
- Request Type
- Status
- Created Date
- Last Updated

Possible statuses:

- Open
- In Review
- In Progress
- Completed
- Rejected
- Cancelled

Use the existing request/status system if one already exists.

---

# Create Request

Create a form at:

/portal/requests/new

The client should be able to provide:

- Request Title
- Related Project
- Request Type
- Description
- Priority
- Optional Attachment

Request types can include:

- Change Request
- Bug/Issue
- General Request
- Question
- Other

Keep the available options simple.

---

# Request Validation

Validate:

- Title is required.
- Project is required where applicable.
- Description is required.
- Request type is valid.
- Priority is valid.
- Attachment type/size is valid if attachments are supported.

Display clear validation messages.

---

# Project Association

A client should only be able to select projects belonging to their own customer/company.

Do not allow the client to submit a request against another customer's project by manipulating the request payload.

Verify project ownership server-side.

---

# Request Details

The `/portal/requests/[id]` page should display:

- Request Title
- Request Type
- Description
- Related Project
- Priority
- Status
- Created Date
- Last Updated
- Attachments
- Updates/Responses

The client should be able to understand the current state of their request.

---

# Request Updates

Allow authorized internal staff to update the request.

Clients should be able to see client-safe updates.

Display a simple timeline:

```text
Request Created
      ↓
Under Review
      ↓
Work Started
      ↓
Completed