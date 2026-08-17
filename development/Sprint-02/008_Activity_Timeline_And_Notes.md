# Sprint 02 - Task 008

# Activity Timeline, Notes & Customer Interaction History

Status: Completed

Priority: High

Estimated Time: 8–12 Hours

---

# Objective

Build a centralized Activity Timeline and Notes system for AVEX CRM.

Every important action performed inside the CRM should automatically be recorded, allowing businesses to track the complete history of customers and leads. Users should also be able to add internal notes, mention team members, attach files, and maintain a complete interaction history.

This module should integrate seamlessly with Customers, Leads, Projects, Invoices, and future modules.

---

# Requirements

Implement a complete Activity & Notes module.

The module must support:

- Activity Timeline
- Internal Notes
- Rich Text Editor
- User Mentions
- File Attachments
- Activity Filters
- Search
- Pinned Notes
- Audit History

---

# Activity Timeline

Create a chronological timeline for every customer and lead.

Automatically record events such as:

- Customer Created
- Customer Updated
- Customer Archived
- Customer Restored
- Lead Created
- Lead Updated
- Lead Assigned
- Lead Stage Changed
- Lead Converted
- Note Added
- File Uploaded
- Employee Assigned
- Status Changed
- Invoice Generated (Future)
- Project Created (Future)
- Meeting Scheduled (Future)

Each activity should display:

- Activity Icon
- Description
- User
- Date
- Time

Newest activities should appear first.

---

# Internal Notes

Users should be able to create private notes.

Each note should include:

- Rich Text Content
- Author
- Created Date
- Updated Date

Notes should only be visible to authorized company users.

Clients must never see internal notes.

---

# Rich Text Editor

Support:

- Bold
- Italic
- Underline
- Bullet Lists
- Numbered Lists
- Hyperlinks
- Code Blocks
- Block Quotes

Keep the editor lightweight and responsive.

---

# User Mentions

Allow users to mention employees.

Example:

@Ali

When a user is mentioned:

- Create a notification.
- Link to the note.
- Highlight the mention.

---

# File Attachments

Allow attaching files to notes.

Supported formats:

- PDF
- DOCX
- XLSX
- PNG
- JPG
- JPEG

Maximum file size:

- 10 MB

Store file metadata securely.

Future cloud storage integrations can be added later.

---

# Pinned Notes

Allow important notes to be pinned.

Pinned notes should always appear at the top of the Notes section.

---

# Activity Filters

Allow filtering activities by:

- Date
- User
- Module
- Activity Type

Support multiple filters simultaneously.

---

# Search

Search within:

- Notes
- Activity Descriptions
- Mentioned Users

Display results instantly.

---

# Activity Categories

Organize activities into categories.

Examples:

- CRM
- Customers
- Leads
- Projects
- Invoices
- Meetings
- System

Allow future categories to be added easily.

---

# Audit History

Maintain a secure audit trail.

Track:

- Previous Value
- New Value
- Updated By
- Updated At

Example:

Status:

Prospect → Active

This data should not be editable.

---

# Notifications

Trigger notifications when:

- User Mentioned
- Note Assigned
- Important Activity Logged

Integrate with the notification system from Sprint 01.

---

# Database

Create relationships for:

- Activities
- Notes
- Attachments
- Mentions

Link records with:

- Company
- Customer
- Lead
- Employee

Ensure proper tenant isolation.

---

# API

Create secure API endpoints for:

- Create Note
- Update Note
- Delete Note
- Pin Note
- Fetch Timeline
- Fetch Notes
- Search Notes
- Filter Activities

Validate all requests.

---

# Security

Ensure:

- Authentication required
- Tenant isolation
- Role-based authorization
- Input validation
- Secure file uploads

Users must only access activities and notes belonging to their own company.

---

# Performance

Optimize for large timelines.

Requirements:

- Pagination
- Infinite Scroll
- Lazy Loading
- Efficient Queries

---

# UI

Create:

- Activity Timeline
- Notes Panel
- Rich Text Editor
- Mention Suggestions
- Attachment Viewer
- Filter Panel
- Search Bar
- Empty States
- Loading Skeletons

Follow the AVEX CRM design system.

Use subtle hover animations and smooth transitions.

---

# Responsive Design

Support:

- Desktop
- Tablet
- Mobile

Timeline and Notes should remain easy to use on smaller screens.

---

# Error Handling

Handle:

- Failed Note Creation
- Upload Errors
- Mention Errors
- Network Errors
- Permission Errors

Display clear and user-friendly messages.

---

# Constraints

Do not implement:

- Client Comments
- AI Note Generation
- Voice Notes
- Video Notes
- Real-time Collaborative Editing

Focus only on internal activity tracking and note management.

---

# Deliverables

- Activity Timeline
- Internal Notes
- Rich Text Editor
- User Mentions
- File Attachments
- Pinned Notes
- Search
- Activity Filters
- Audit History
- Notifications
- Secure API Endpoints
- Database Integration

---

# Acceptance Criteria

- Activities are logged automatically.
- Users can create, edit, pin, and delete notes.
- Mentions notify users correctly.
- Attachments upload successfully.
- Search works.
- Filters work.
- Audit history records changes correctly.
- Tenant isolation is enforced.
- Responsive layout works.
- No TypeScript errors.
- No ESLint errors.

---

# Definition of Done

This task is complete when AVEX CRM provides a complete Activity Timeline and Internal Notes system with automatic event logging, rich text notes, user mentions, attachments, audit history, search, filters, notifications, and secure multi-tenant support, giving every customer and lead a complete interaction history.