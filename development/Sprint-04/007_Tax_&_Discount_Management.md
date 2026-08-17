# Sprint 04 - Task 007

# Tax & Discount Management System

Status: Not Started

Priority: High

Estimated Time: 10–14 Hours

---

# Objective

Build a flexible Tax & Discount Management System for AVEX CRM.

This module will allow businesses to create, manage, and apply multiple tax rates and discount rules across quotations, invoices, and projects. It should support different tax configurations for various countries and business requirements while remaining simple to configure.

This module is **not** intended to replace a complete accounting or tax filing system.

---

# Requirements

Implement a complete Tax & Discount Management module.

The module must support:

- Tax Management
- Discount Management
- Tax Templates
- Tax Calculation
- Discount Calculation
- Invoice Integration
- Quotation Integration
- Reports Integration
- Activity Logging
- Notifications

---

# Tax Management

Allow administrators to create taxes.

Each tax should include:

- Tax Name
- Tax Code (Optional)
- Tax Percentage
- Tax Type
- Description
- Status

Examples:

- GST
- VAT
- Sales Tax
- Service Tax

Support multiple tax rates.

---

# Tax Types

Support:

- Inclusive Tax
- Exclusive Tax

Allow businesses to choose the default calculation method.

---

# Tax Status

Each tax can have one of the following statuses:

- Active
- Inactive

Inactive taxes should remain available for historical records but cannot be assigned to new invoices or quotations.

---

# Tax Templates

Allow businesses to create reusable tax templates.

Examples:

- Pakistan GST
- UAE VAT
- UK VAT
- USA Sales Tax

Each template can include:

- One or More Taxes
- Default Tax Rates
- Default Calculation Method

Allow administrators to select a default template.

---

# Discount Management

Allow users to create discounts.

Support:

- Percentage Discount
- Fixed Amount Discount

Discounts can be applied to:

- Entire Invoice
- Entire Quotation
- Individual Line Items

Automatically update totals.

---

# Discount Rules

Allow businesses to configure rules.

Examples:

- Early Payment Discount
- Seasonal Discount
- Promotional Discount
- Loyalty Discount

Each rule should include:

- Name
- Description
- Discount Type
- Discount Value
- Start Date
- End Date
- Status

Prepare for automatic rule application in future updates.

---

# Invoice Integration

Allow taxes and discounts to be applied while creating or editing invoices.

Display:

- Applied Taxes
- Applied Discounts
- Tax Breakdown
- Final Total

Automatically recalculate totals whenever values change.

---

# Quotation Integration

Allow taxes and discounts to be applied to quotations.

Support:

- Line Item Discounts
- Overall Discounts
- Multiple Taxes

Maintain consistency with invoices.

---

# Tax Summary

Display:

- Total Tax Collected
- Tax by Type
- Tax by Period
- Tax Applied per Invoice

Use this data in financial reports.

---

# Discount Summary

Display:

- Total Discounts Given
- Discounts by Type
- Discounts by Customer
- Discounts by Project

---

# Search

Support searching by:

- Tax Name
- Discount Name
- Template Name

Reuse the Global Search system.

---

# Filters

Support filtering by:

- Tax Status
- Tax Type
- Discount Type
- Active Rules
- Date Range

Allow combining multiple filters.

---

# Activity Logging

Automatically record:

- Tax Created
- Tax Updated
- Tax Deleted (Soft Delete)
- Discount Created
- Discount Updated
- Discount Deleted
- Tax Template Created
- Default Template Changed

Integrate with the global Activity Timeline.

---

# Notifications

Notify administrators when:

- Tax Created
- Tax Updated
- Discount Rule Activated
- Discount Rule Expired
- Default Tax Template Changed

Reuse the notification system from Sprint 01.

---

# Database

Create models for:

- Taxes
- Tax Templates
- Discounts
- Discount Rules

Relationships:

Company

↓

Tax Templates

↓

Taxes

↓

Invoices

↓

Quotations

Maintain complete tenant isolation.

---

# API

Create secure API endpoints for:

- Create Tax
- Update Tax
- Delete Tax (Soft Delete)
- Fetch Taxes
- Create Discount
- Update Discount
- Delete Discount
- Fetch Discounts
- Create Tax Template
- Set Default Template

Validate all requests.

Return standardized API responses.

---

# Security

Ensure:

- Authentication required
- Tenant isolation
- Role-based authorization
- Input validation

Only administrators and authorized finance users may manage taxes and discounts.

---

# Performance

Optimize:

- Tax Calculations
- Discount Calculations
- Invoice Total Updates
- Search
- Filters

Avoid unnecessary recalculations.

---

# UI

Create:

- Tax Dashboard
- Tax List
- Discount List
- Tax Template Manager
- Tax Settings
- Discount Rules Page
- Tax Summary
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

Tax and discount management should remain fully usable across all supported devices.

---

# Error Handling

Handle:

- Invalid Tax Rate
- Duplicate Tax Name
- Invalid Discount
- Template Not Found
- Permission Errors
- Validation Errors
- Network Errors

Display clear and user-friendly error messages.

---

# Constraints

Do not implement:

- Automatic Tax Filing
- Government API Integration
- AI Tax Recommendations
- Multi-Currency Tax Conversion
- Accounting Ledger Integration

These features may be implemented in future sprints.

---

# Deliverables

- Tax Management System
- Tax Templates
- Discount Management
- Discount Rules
- Invoice & Quotation Integration
- Tax & Discount Summaries
- Activity Logging
- Notifications
- Secure API Endpoints
- Database Integration

---

# Acceptance Criteria

- Taxes can be created, edited, and deleted.
- Multiple tax rates are supported.
- Inclusive and exclusive taxes calculate correctly.
- Discounts apply correctly to invoices and quotations.
- Tax templates can be created and assigned.
- Financial totals update automatically.
- Activity logs are recorded.
- Notifications trigger correctly.
- Multi-tenant isolation is enforced.
- No TypeScript errors.
- No ESLint errors.
- Application builds successfully.

---

# Definition of Done

This task is complete when AVEX CRM provides a production-ready Tax & Discount Management System with configurable tax rates, reusable tax templates, flexible discount rules, seamless invoice and quotation integration, reporting support, notifications, and secure multi-tenant architecture.