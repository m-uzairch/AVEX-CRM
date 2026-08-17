# PROJECT_CONTEXT.md

# AVEX CRM

## Overview

AVEX CRM is an AI-powered, multi-tenant SaaS CRM and Business Management Platform designed for businesses of all sizes.

The goal is to provide a single platform to manage customers, leads, projects, employees, invoices, reports, and business operations.

---

# Vision

Build a modern, fast, scalable, and easy-to-use CRM that can grow into a complete business management solution.

The application should be modular so new features can be added without major changes to the existing codebase.

---

# Target Users

- Software Houses
- Marketing Agencies
- Design Agencies
- Freelancers
- Retail Businesses
- Service Providers
- Small and Medium Businesses

---

# Core Features

- Authentication
- Multi-Tenant Companies
- Customer Management
- Lead Management
- Lead Pipeline
- Projects
- Tasks
- Employee Management
- Attendance
- Client Portal
- Invoice Generation
- Payment Tracking
- Reports & Analytics
- Notifications
- AI CSV/PDF Lead Import
- OCR Document Scanning
- Search
- Activity Timeline
- Notes
- Google Calendar Integration
- Dark Mode
- PWA Support

---

# Tech Stack

Frontend

- Next.js 15
- React
- TypeScript
- Tailwind CSS
- shadcn/ui

Backend

- Next.js API Routes
- Prisma ORM
- Supabase PostgreSQL
- Supabase Auth

Additional Services

- Gemini API
- Redis
- BullMQ
- Resend
- WhatsApp Cloud API

Deployment

- Vercel (initially)

---

# Development Goals

- Build one feature at a time.
- Keep the code modular.
- Follow enterprise development practices.
- Prioritize maintainability and scalability.
- Focus on production-quality code.

---

# Current Development Workflow

Development is organized into sprints.

Each sprint contains multiple tasks.

Antigravity should complete one task at a time and wait for the next task before implementing additional features.

---

# Current Status

Sprint 1 (Foundation)
✅ Project Setup & Infrastructure
✅ UI Foundation & Design Tokens
✅ Database Models & Multi-Tenant Setup
✅ Supabase Authentication
✅ RBAC Matrix & Middleware Protection
✅ Dashboard Layout

Sprint 2 (CRM Core & Intelligence)
✅ CRM Foundation & Layout Structure
✅ Customer Management & Bulk Operations
✅ Customer Profile & 360 Degree View
✅ Lead Management, Scoring & Qualification
✅ Lead Pipeline (Interactive Drag-and-Drop Kanban)
✅ AI Lead Import (CSV, XLSX, PDF, Gemini Extraction & OCR)
✅ Global Search, Saved Filters & Smart Tags
✅ Activity Timeline, Internal Notes, Mentions & Attachments
✅ CRM Dashboard, BI Analytics & Report Exports
✅ Sprint 02 QA, Optimization & Verification

Next: Sprint 3 (Project & Operations Management)

---

# UI Style

The interface should be:

- Clean
- Professional
- Minimal
- Fast
- Responsive

Use subtle animations only.

Avoid unnecessary visual effects.

---

# Long-Term Goal

AVEX CRM should become a complete business operating platform that businesses can use to manage their daily operations from a single application.