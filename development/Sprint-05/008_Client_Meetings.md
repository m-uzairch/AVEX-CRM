# Sprint 05 - Task 008

# Client Meetings

Status: Completed

Priority: Medium

---

# Objective

Allow clients to view and manage their scheduled meetings through the Client Portal.

Clients should be able to see upcoming and previous meetings related to their projects and access the relevant meeting information.

Use the existing AVEX CRM meeting/calendar system where possible.

---

# Requirements

Create:

/portal/meetings

/portal/meetings/[id]

---

# Meetings List

The `/portal/meetings` page should display the client's meetings.

Each meeting should show:

- Meeting Title
- Related Project
- Date
- Start Time
- End Time
- Meeting Status
- Meeting Type

Possible meeting types:

- Online
- In Person
- Phone Call
- Other

Use the existing meeting/calendar data where available.

---

# Upcoming Meetings

Display upcoming meetings prominently.

Each meeting should show:

- Meeting title
- Date
- Time
- Related project
- Meeting type
- Meeting location or meeting link

If there are no upcoming meetings, show a simple empty state.

---

# Meeting Details

The `/portal/meetings/[id]` page should display:

- Meeting Title
- Description
- Date
- Start Time
- End Time
- Meeting Type
- Related Project
- Meeting Location
- Meeting Link
- Meeting Status
- Participants where appropriate

Only display client-safe information.

Do not expose internal meeting notes.

---

# Meeting Link

If the meeting has an online meeting link, provide a clear action:

```text
[Join Meeting]