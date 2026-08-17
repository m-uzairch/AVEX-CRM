# Sprint 02 - Task 003

# Customer Profile & 360° Customer View

Status: Completed

Priority: High

Estimated Time: 8–10 Hours

---

# Objective

Build a complete Customer Profile module that provides a 360° view of every customer.

This page should serve as the central hub for all customer-related information, allowing users to view customer details, interactions, projects, invoices, notes, activities, and associated records from one place.

---

# Requirements

Create a dedicated Customer Profile page.

Each customer should have a unique profile accessible from the Customer Management module.

---

# Customer Header

Display:

- Customer Avatar
- Customer Name
- Company Name
- Status Badge
- Priority Badge
- Assigned Employee
- Customer Since
- Last Updated

Include action buttons:

- Edit Customer
- Archive
- Delete
- More Actions

---

# Profile Tabs

Create the following tabs:

- Overview
- Notes
- Activity
- Projects
- Invoices
- Files
- Meetings

Tabs without completed modules should display placeholder content.

---

# Overview

Display:

## Personal Information

- Full Name
- Email
- Phone Number
- Alternate Phone

---

## Company Information

- Company Name
- Industry
- Business Type
- Website
- Company Size

---

## Address

- Country
- State
- City
- Postal Code
- Full Address

---

## CRM Information

- Customer Source
- Priority
- Status
- Assigned Employee
- Created Date
- Last Updated

---

# Customer Summary

Display quick statistics.

Examples:

- Total Projects
- Total Invoices
- Total Payments
- Open Leads
- Last Contact Date

Use placeholder data where future modules are not yet implemented.

---

# Notes

Implement internal notes.

Allow users to:

- Create Notes
- Edit Notes
- Delete Notes

Each note should display:

- Author
- Date
- Time
- Rich Text Content

Notes are internal and not visible to clients.

---

# Activity Timeline

Display chronological customer activity.

Examples:

- Customer Created
- Customer Updated
- Status Changed
- Employee Assigned
- Note Added
- Invoice Generated
- Lead Converted

Automatically log future events.

---

# Projects

Display associated projects.

Include:

- Project Name
- Status
- Assigned Team
- Start Date
- Due Date

For now, display placeholder content until Sprint 03.

---

# Invoices

Display customer invoices.

Include:

- Invoice Number
- Amount
- Due Date
- Payment Status

Placeholder data is acceptable until the Invoice module is completed.

---

# Files

Create a customer files section.

Display uploaded documents.

Examples:

- Contracts
- Agreements
- Quotations
- Receipts

Create the UI only.

File upload functionality will be expanded later.

---

# Meetings

Display customer meetings.

Include:

- Meeting Title
- Date
- Time
- Meeting Type
- Status

Reserve integration for Google Calendar in future sprints.

---

# Customer Tags

Display all assigned tags.

Allow:

- Add Tag
- Remove Tag

Support custom tags.

---

# Assigned Employee

Display:

- Employee Avatar
- Name
- Email
- Role

Allow changing the assigned employee.

---

# Customer Actions

Include quick actions:

- Create Lead
- Create Project
- Generate Invoice
- Schedule Meeting
- Send Email
- Send WhatsApp Message

Buttons can remain placeholders if related modules are incomplete.

---

# Search

Allow searching within:

- Notes
- Activity Timeline
- Files

---

# Database

Extend customer relationships.

Connect with:

- Notes
- Activities
- Projects
- Invoices
- Files
- Meetings
- Assigned Employee

Use proper foreign keys and tenant isolation.

---

# API

Create secure API endpoints for:

- Fetch Customer Profile
- Update Customer
- Notes CRUD
- Timeline Retrieval
- Tag Management

Ensure authorization is enforced.

---

# Security

Ensure:

- Company isolation
- Role-based access
- Authorization checks
- Input validation

Users must only access customers within their own company.

---

# UI

Follow the existing design system.

Include:

- Responsive Layout
- Tab Navigation
- Cards
- Timeline Component
- Empty States
- Loading Skeletons

---

# Responsive Design

Support:

- Desktop
- Tablet
- Mobile

Tabs should remain usable on smaller screens.

---

# Error Handling

Handle:

- Customer Not Found
- Unauthorized Access
- Failed Data Loading
- Network Errors

Display clear and user-friendly messages.

---

# Constraints

Do not implement:

- Project Logic
- Invoice Logic
- Meeting Logic
- File Upload Logic
- Email Sending
- WhatsApp Integration

Only prepare the profile page and connect existing customer data.

---

# Deliverables

- Customer Profile Page
- Overview Tab
- Notes System
- Activity Timeline
- Customer Summary
- Tags Management
- Assigned Employee Section
- Placeholder Projects Tab
- Placeholder Invoices Tab
- Placeholder Files Tab
- Placeholder Meetings Tab
- Secure API Endpoints

---

# Acceptance Criteria

- Customer profile loads successfully.
- Customer details can be updated.
- Notes CRUD works correctly.
- Activity timeline displays properly.
- Tags can be managed.
- Tenant isolation is enforced.
- Responsive layout works.
- No TypeScript errors.
- No ESLint errors.

---

# Definition of Done

This task is complete when every customer has a dedicated 360° profile page displaying all relevant customer information, internal notes, activity history, assigned employee details, and placeholders for future CRM modules, following the AVEX CRM design system and security standards.