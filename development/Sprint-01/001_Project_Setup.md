# Sprint 01 - Task 001

# Project Setup & Foundation

Status: Not Started

Priority: Critical

Estimated Time: 2–4 Hours

---

# Objective

Initialize the AVEX CRM project and configure a production-ready development environment.

This task establishes the technical foundation for the entire application.

No business features (CRM, Projects, Invoices, Attendance, etc.) should be implemented in this task.

The goal is to create a clean, scalable, maintainable project structure that follows modern enterprise standards.

---

# Project Information

Project Name

AVEX CRM

Description

An AI-powered multi-tenant SaaS CRM and Business Management Platform.

Primary Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- Prisma
- PostgreSQL
- Gemini API
- BullMQ
- Redis
- shadcn/ui

---

# Core Principles

The generated code must be:

- Production Ready
- Modular
- Strongly Typed
- Fully Documented
- Reusable
- Maintainable
- Scalable

Avoid quick fixes or shortcuts.

The architecture should support years of future development.

---

# Tasks

## 1. Initialize Project

Create a new Next.js project using:

- Latest stable Next.js
- App Router
- TypeScript
- ESLint
- Turbopack
- npm package manager

Do not use JavaScript.

---

## 2. Configure TypeScript

Enable strict mode.

Enable recommended compiler options.

Use path aliases.

Example:

@/components

@/features

@/lib

@/services

@/types

@/hooks

@/utils

---

## 3. Install Core Dependencies

Install and configure the latest stable versions of:

### UI

- Tailwind CSS
- shadcn/ui
- Lucide Icons
- class-variance-authority
- clsx
- tailwind-merge
- next-themes
- Framer Motion (subtle animations only)

### Forms

- React Hook Form
- Zod
- @hookform/resolvers

### Database

- Prisma
- @prisma/client

### Authentication

- @supabase/supabase-js
- @supabase/ssr

### Tables

- TanStack Table

### Data Fetching

- TanStack Query

### State

- Zustand

### Date

- date-fns

### Charts

- Recharts

### Utilities

- uuid
- nanoid

### Logging

- Pino

Do not install unnecessary packages.

---

## 4. Folder Structure

Create a clean enterprise folder structure.

app/

components/

features/

hooks/

lib/

providers/

services/

stores/

styles/

types/

utils/

config/

constants/

middleware/

public/

prisma/

docs/

development/

Every folder should contain a README.md briefly describing its purpose (optional but recommended).

---

## 5. Configure Tailwind CSS

Configure Tailwind properly.

Use CSS variables for colors.

Support dark mode.

Create reusable design tokens.

Examples:

Primary

Secondary

Success

Warning

Danger

Muted

Border

Background

Foreground

Radius

Spacing

---

## 6. Configure shadcn/ui

Initialize shadcn/ui.

Ensure all components use:

- Tailwind
- Radix UI
- CSS Variables

Do not customize components yet.

---

## 7. Configure Theme

Implement:

- Light Theme
- Dark Theme
- System Theme

Persist the selected theme.

---

## 8. Configure ESLint

Use strict linting rules.

Prevent:

- any
- unused variables
- console.log in production code
- inconsistent imports

---

## 9. Configure Prettier

Create a consistent formatting configuration.

---

## 10. Configure Environment Variables

Create:

.env.example

Include placeholders for:

NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

DATABASE_URL=

DIRECT_URL=

REDIS_URL=

GEMINI_API_KEY=

RESEND_API_KEY=

WHATSAPP_ACCESS_TOKEN=

WHATSAPP_PHONE_NUMBER_ID=

Do not hardcode secrets.

---

## 11. Configure Git Ignore

Ensure common generated files are ignored.

---

## 12. Configure Metadata

Application Name

AVEX CRM

Description

AI Powered Business CRM

Icons

Basic favicon placeholder

---

## 13. Landing Page

Create a temporary landing page.

Purpose:

Verify the project works correctly.

The page should include:

- AVEX CRM logo placeholder
- Project title
- Version
- Theme toggle
- Simple CTA button
- Responsive layout

Keep the design minimal.

No dashboard yet.

---

## 14. Error Handling

Create:

404 page

Global error page

Loading page

Use Next.js App Router conventions.

---

## 15. Loading States

Create reusable loading components.

Skeleton Loader

Spinner

Page Loader

These will be reused throughout the application.

---

## UI Guidelines

The interface should feel similar to:

- Linear
- Vercel Dashboard
- GitHub
- Stripe Dashboard

Avoid:

❌ Glassmorphism

❌ Neon effects

❌ Heavy gradients

❌ Fancy animations

Use:

✅ Clean spacing

✅ Rounded corners

✅ Subtle shadows

✅ Hover transitions

✅ Professional typography

Animations should only be used for:

Hover

Loading

Dropdowns

Dialogs

Navigation

---

# Constraints

Do not implement:

Authentication

CRM

Projects

Invoices

Attendance

Employees

Inventory

Notifications

AI

Database Models

Business Logic

Only configure the project foundation.

---

# Deliverables

By the end of this task the project should include:

- Working Next.js application
- Configured TypeScript
- Tailwind CSS
- shadcn/ui
- Theme support
- Folder structure
- Environment configuration
- Landing page
- Error pages
- Loading components

The application should run without errors.

---

# Acceptance Criteria

✅ npm install completes successfully

✅ npm run dev starts successfully

✅ TypeScript compiles with zero errors

✅ ESLint passes

✅ Tailwind CSS works correctly

✅ Dark mode works

✅ Theme preference persists

✅ shadcn/ui components render correctly

✅ Folder structure follows specification

✅ Landing page is responsive

✅ No unused dependencies

---

# Definition of Done

This task is complete only when the application provides a clean, production-ready foundation for future feature development without requiring refactoring.