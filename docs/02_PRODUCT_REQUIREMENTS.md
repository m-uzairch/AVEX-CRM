# AVEX CRM
# Product Requirements Document (PRD)

Version: 1.0

Status: Draft

---

# 1. Introduction

AVEX CRM is a modern, AI-powered, multi-tenant SaaS Business Management Platform designed to help businesses manage every aspect of their operations from a single application.

Instead of offering only Customer Relationship Management, AVEX CRM provides an integrated ecosystem including:

- CRM
- Lead Management
- Project Management
- Employee Management
- Attendance Management
- Inventory Management
- Invoice Generation
- Payment Tracking
- Client Portal
- Reports & Analytics
- AI Automation
- Notifications
- Business Insights

The platform must be modular, scalable, secure, and production-ready.

---

# 2. Business Goals

The application should help businesses:

• Increase productivity

• Centralize business operations

• Improve employee collaboration

• Improve customer communication

• Reduce repetitive tasks through AI

• Generate professional invoices

• Track projects

• Track employee attendance

• Manage inventory

• Generate business reports

• Analyze company performance

---

# 3. Target Businesses

AVEX CRM should support:

- Software Houses
- Printing Presses
- Marketing Agencies
- Digital Agencies
- Retail Stores
- Wholesale Businesses
- Construction Companies
- Medical Clinics
- Educational Institutes
- Restaurants
- Manufacturing Companies
- Service Providers
- Consultants
- Freelancers

---

# 4. User Roles

The system should support the following roles.

## Super Admin

Platform owner.

Responsibilities:

- Manage all companies
- View platform analytics
- Enable/disable modules
- Manage feature flags
- View logs
- Manage announcements
- Monitor system health

---

## Company Admin

Business owner.

Responsibilities:

- Manage employees
- Manage customers
- Manage projects
- Manage inventory
- Manage invoices
- Manage attendance
- View reports
- Configure company settings

---

## Manager

Responsibilities:

- Assign projects
- Assign tasks
- Monitor employees
- View reports
- Schedule meetings
- Review attendance

---

## Employee

Responsibilities:

- View assigned tasks
- Check attendance
- Check in/out
- Update task progress
- View projects
- Receive notifications
- View calendar

---

## Client

Responsibilities:

- View project status
- Track progress
- View invoices
- Track payments
- Request revisions
- View meetings
- Receive notifications

---

# 5. Company Onboarding

Every new company should complete an onboarding wizard.

Step 1

Company Information

- Company Name
- Industry
- Country
- Currency
- Timezone
- Team Size

Step 2

Business Type

- Product Business
- Service Business
- Hybrid

Step 3

Business Category

Examples:

- Printing
- Software
- Marketing
- Medical
- Retail
- Restaurant
- Construction
- Manufacturing
- Education
- Other

Step 4

Module Selection

Enable modules based on business type.

Example

Software Company

Enable:

- CRM
- Projects
- Client Portal
- Meetings
- Invoices
- Attendance

Retail Store

Enable:

- CRM
- Inventory
- Products
- Suppliers
- Invoices
- Attendance

Users can enable or disable modules later.

---

# 6. CRM Module

The CRM module should support:

Customers

Companies

Contacts

Customer Notes

Customer Tags

Customer Timeline

Customer Search

Customer Filters

Customer Import

Customer Export

Customer Analytics

---

# Customer Information

Each customer should contain:

- Name
- Company
- Email
- Phone
- Address
- Industry
- Tags
- Assigned Employee
- Created Date
- Last Activity

---

# 7. Lead Management

Support complete lead lifecycle.

Pipeline

New Lead

↓

Contacted

↓

Qualified

↓

Proposal Sent

↓

Negotiation

↓

Won

↓

Lost

Users should be able to customize pipeline stages.

---

# Lead Information

Each lead contains:

- Name
- Company
- Email
- Phone
- Source
- Estimated Value
- Assigned Employee
- Notes
- Tags

---

# Automatic Conversion

When a lead becomes Won:

Automatically:

Create Customer

Create Project

Assign Team

Create Timeline

Notify Employee

Notify Company Admin

Log Activity

---

# 8. Project Management

Every project should include:

Project Name

Customer

Assigned Employees

Priority

Status

Timeline

Progress

Tasks

Comments

Activity Feed

Meetings

Due Date

Milestones

Kanban Board

Calendar View

List View

---

# Project Stages

Planning

↓

Design

↓

Development

↓

Testing

↓

Review

↓

Completed

Admins can customize project stages.

---

# 9. Employee Management

Employee Profile

Role

Department

Designation

Joining Date

Attendance

Assigned Tasks

Performance

Notifications

Activity Timeline

Documents (future-ready)

---

# 10. Attendance System

Employees should be able to:

Check In

Check Out

Break Start

Break End

View Attendance History

View Monthly Attendance

View Working Hours

View Overtime

Managers can:

Approve Corrections

Monitor Attendance

View Reports

Future Ready:

Shift Scheduling

Leave Management

QR Check-in

Geofencing

---

# 11. Task Management

Support:

Task Assignment

Priority

Due Date

Comments

Subtasks

Attachments (future)

Recurring Tasks

Task History

Task Notifications

---

# 12. Calendar

Integrate with:

Google Calendar

Meetings

Deadlines

Task Due Dates

Attendance Events

Project Milestones

---

# 13. Client Portal

Clients should be able to:

Login

View Project

Track Progress

Track Payments

View Meetings

Request Changes

Receive Notifications

Comment on Deliverables

---

# 14. Inventory

Support:

Products

Services

Categories

Stock

Suppliers

Purchase Orders

Stock Alerts

Inventory Reports

Only enable inventory for businesses that require it.

---

# 15. Invoice System

Support:

Quotes

Invoices

PDF Export

Printing

Taxes

Discounts

Multiple Currency

Payment Tracking

Payment Reminders

Invoice Timeline

Online payment gateways are not part of the first release but the architecture must support adding them later.

---

# 16. Reports

Generate reports for:

Sales

Customers

Projects

Employees

Attendance

Inventory

Invoices

Payments

Lead Conversion

Business Growth

Export:

PDF

Excel

CSV

---

# 17. AI Module

Powered by Gemini.

Capabilities:

OCR

CSV Import

PDF Import

Lead Extraction

Customer Import

AI Sales Insights

Business Reports

Meeting Summaries

Email Drafting

WhatsApp Drafting

Suggested Follow-ups

AI should always show a preview before importing or applying changes.

Uploaded files must be processed temporarily and removed after extraction.

---

# 18. Notifications

Support:

In-App Notifications

Email Notifications

WhatsApp Notifications

Browser Notifications

Task Alerts

Meeting Reminders

Payment Reminders

Attendance Alerts

Project Updates

---

# 19. Search

Global Search

Support:

Customers

Projects

Invoices

Employees

Products

Tasks

Meetings

Keyboard Shortcut:

Ctrl + K

---

# 20. Analytics Dashboard

Different dashboards for:

Super Admin

Company Admin

Manager

Employee

Client

Each dashboard should show only relevant information.

---

# 21. Future Modules

The architecture should support adding:

Payroll

HR

Recruitment

Customer Support

Live Chat

Workflow Automation

Subscription Billing

Marketplace

Mobile Apps

Business Intelligence

Without major architectural changes.

---

# 22. Non-Functional Requirements

The system must be:

Secure

Scalable

Responsive

Accessible

Fast

Maintainable

Modular

Production Ready

Documented

Testable

---

# Conclusion

Every feature described in this document must integrate seamlessly with the rest of the platform. AVEX CRM should provide a unified experience where businesses can manage customers, employees, projects, operations, attendance, invoicing, inventory, and AI-powered workflows from a single, secure, and intuitive application.