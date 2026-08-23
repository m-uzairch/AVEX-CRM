# Sprint 05 - Task 004

# Client Project View

Status: Completed

Priority: High

---

# Objective

Build the Client Portal project section.

Clients should be able to view their projects and open an individual project to see its current status, progress, phase, next steps, and basic project information.

Use the existing project data and relationships from AVEX CRM.

---

# Requirements

Create:

/portal/projects

/portal/projects/[id]

---

# Projects List

The `/portal/projects` page should display the client's projects.

Each project should show:

- Project Name
- Status
- Progress
- Start Date
- Expected Completion Date
- Last Updated

Allow the client to open a project to view its details.

Only projects belonging to the authenticated client's customer/company should be displayed.

---

# Project Details

The `/portal/projects/[id]` page should display:

- Project Name
- Project Description
- Project Status
- Overall Progress
- Start Date
- Expected Completion Date
- Current Phase
- Next Step
- Last Updated

If the existing project model contains additional useful client-safe information, it may be displayed.

Do not expose internal CRM information.

---

# Project Progress

Display the overall project progress clearly.

For example:

0% ─────────────── 100%

Also display the current project status, such as:

- Not Started
- In Progress
- On Hold
- Completed

Use the existing project status system where available.

Do not create a second project status system.

---

# Project Phases

If project phases already exist in the AVEX CRM system, display them.

Each phase should show:

- Phase Name
- Status
- Progress
- Completion information

Highlight the current phase.

If the existing system does not yet contain project phases, keep this section compatible with the existing project structure without creating unnecessary new architecture.

---

# Next Steps

Display the next important step for the client.

Example:

Next Step

> Client approval required before development begins.

Use existing project/task data where possible.

Do not generate artificial project information.

---

# Project Tasks

Display client-safe project tasks when applicable.

Show:

- Task Name
- Status
- Due Date

Clients should only see tasks that are intended to be visible to them.

Do not expose internal employee notes, internal comments, or private tasks.

---

# API

Create or update the required Client Portal project APIs.

The API must:

- Authenticate the client.
- Verify the client role.
- Determine the authenticated client's customer/company.
- Retrieve only authorized projects.
- Verify ownership on individual project requests.
- Return only client-safe fields.

Do not accept `customerId` or `companyId` from the client as the source of authorization.

Use the authenticated session to determine ownership.

---

# Security

A client must not be able to access another client's project by changing:

```text
/portal/projects/[id]