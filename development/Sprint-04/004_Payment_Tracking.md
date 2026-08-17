# Sprint 04 - Task 004

# Payment Tracking System

Status: Not Started

Priority: Critical

Estimated Time: 12–16 Hours

---

# Objective

Build a complete Payment Tracking System for AVEX CRM.

This module will allow businesses to monitor invoice payments, outstanding balances, payment history, due dates, and overdue invoices. AVEX CRM will **not process payments**. Instead, it will serve as a financial tracking and reminder system that integrates with invoices, customers, projects, reports, and notifications.

---

# Requirements

Implement a complete Payment Tracking module.

The module must support:

- Payment Records
- Outstanding Balance Tracking
- Partial Payments
- Due Date Management
- Overdue Detection
- Payment History
- Payment Notes
- Payment Reminders
- Activity Logging
- Notifications

---

# Payment Records

Allow authorized users to manually record payments.

Each payment should include:

- Invoice
- Customer
- Project (Optional)
- Payment Date
- Payment Amount
- Payment Method
- Reference Number
- Notes

Payments are recorded manually.

No payment gateway integration.

---

# Payment Methods

Support the following payment methods:

- Cash
- Bank Transfer
- Credit Card
- Debit Card
- Cheque
- Mobile Wallet
- Other

Allow adding custom methods in future updates.

---

# Payment Status

Automatically calculate invoice payment status.

Statuses:

- Unpaid
- Partially Paid
- Paid
- Overdue
- Cancelled

Status updates automatically based on recorded payments.

---

# Outstanding Balance

Automatically calculate:

- Invoice Total
- Total Paid
- Remaining Balance

Display balances on:

- Invoice Details
- Customer Profile
- Financial Dashboard

---

# Partial Payments

Support multiple payments for a single invoice.

Display:

- Payment Timeline
- Remaining Balance
- Percentage Paid

Automatically update invoice status after every payment.

---

# Payment History

Maintain complete payment history.

Each record should display:

- Payment Date
- Amount
- Payment Method
- Recorded By
- Reference Number
- Notes

Payment history cannot be permanently deleted.

Use soft delete if corrections are required.

---

# Due Date Tracking

Track invoice due dates.

Display:

- Days Remaining
- Due Today
- Overdue Days

Highlight overdue invoices using warning indicators.

---

# Payment Reminders

Automatically generate reminders.

Reminder schedule:

- 7 Days Before Due Date
- 3 Days Before Due Date
- Due Date
- 3 Days Overdue
- 7 Days Overdue
- 15 Days Overdue

Support:

- In-App Notifications
- Email Notifications

Prepare the architecture for future WhatsApp reminders.

---

# Customer Payment Summary

Display on the Customer Profile:

- Total Invoiced
- Total Paid
- Outstanding Balance
- Overdue Amount
- Recent Payments

---

# Project Payment Summary

Display on Project Details:

- Linked Invoices
- Total Project Value
- Amount Received
- Remaining Balance

---

# Payment Notes

Allow staff to add internal notes.

Examples:

- Customer requested extension
- Payment expected next week
- Bank confirmation pending

Payment notes remain internal and are not visible to clients.

---

# Search

Support searching by:

- Invoice Number
- Customer Name
- Reference Number
- Payment Method

Reuse the Global Search system.

---

# Filters

Support filtering by:

- Payment Status
- Payment Method
- Customer
- Project
- Date Range
- Due Date

Allow combining multiple filters.

---

# Activity Logging

Automatically record:

- Payment Recorded
- Payment Updated
- Payment Deleted (Soft Delete)
- Reminder Sent
- Invoice Marked Paid
- Invoice Marked Overdue

Integrate with the global Activity Timeline.

---

# Notifications

Notify users when:

- Payment Recorded
- Invoice Fully Paid
- Partial Payment Received
- Invoice Due Soon
- Invoice Overdue
- Payment Reminder Sent

Reuse the notification system from Sprint 01.

---

# Database

Create models for:

- Payments
- Payment Methods
- Payment Notes
- Payment Activity

Relationships:

Company

↓

Customer

↓

Project (Optional)

↓

Invoice

↓

Payments

Maintain complete tenant isolation.

---

# API

Create secure API endpoints for:

- Record Payment
- Update Payment
- Delete Payment (Soft Delete)
- Fetch Payments
- Fetch Outstanding Invoices
- Generate Payment Summary
- Send Payment Reminder

Validate all requests.

Return standardized API responses.

---

# Security

Ensure:

- Authentication required
- Multi-tenant isolation
- Role-based authorization
- Input validation

Only authorized users may record or modify payments.

Clients can only view payment status through the Client Portal.

---

# Performance

Optimize:

- Payment Queries
- Outstanding Balance Calculations
- Dashboard Widgets
- Search
- Filters

Use pagination for payment history.

---

# UI

Create:

- Payments Dashboard
- Payment History
- Record Payment Form
- Invoice Payment Timeline
- Customer Payment Summary
- Project Payment Summary
- Outstanding Invoices Page
- Overdue Payments Page
- Search Bar
- Filters Panel
- Loading Skeletons
- Empty States

Follow the AVEX CRM design system.

Use a clean, professional interface with subtle hover effects and smooth loading animations.

Avoid flashy UI.

---

# Responsive Design

Support:

- Desktop
- Tablet
- Mobile

Payment tracking and history should remain usable across all screen sizes.

---

# Error Handling

Handle:

- Invoice Not Found
- Duplicate Payment Reference
- Invalid Payment Amount
- Permission Errors
- Validation Errors
- Network Errors

Display clear and user-friendly error messages.

---

# Constraints

Do not implement:

- Online Payment Gateway
- Stripe Integration
- PayPal Integration
- Refund Processing
- Subscription Billing
- Automatic Bank Synchronization

These features may be implemented in future sprints.

---

# Deliverables

- Payment Tracking System
- Manual Payment Recording
- Partial Payments
- Outstanding Balance Tracking
- Due Date Monitoring
- Overdue Detection
- Payment History
- Payment Notes
- Payment Reminders
- Customer & Project Payment Summaries
- Notifications
- Activity Logging
- Secure API Endpoints
- Database Integration

---

# Acceptance Criteria

- Payments can be recorded manually.
- Partial payments update invoice balances correctly.
- Outstanding balances are calculated accurately.
- Overdue invoices are detected automatically.
- Payment reminders are generated on schedule.
- Customer and project payment summaries display correctly.
- Payment history is maintained.
- Notifications are triggered correctly.
- Activity logs are recorded.
- Multi-tenant isolation is enforced.
- No TypeScript errors.
- No ESLint errors.
- Application builds successfully.

---

# Definition of Done

This task is complete when AVEX CRM provides a production-ready Payment Tracking System that enables businesses to manually record payments, monitor outstanding balances, manage partial payments, track due dates, generate reminders, and integrate seamlessly with invoices, customers, projects, dashboards, and the multi-tenant architecture without processing online payments.