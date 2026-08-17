# Sprint 01 - Task 003

# Supabase & Database Configuration

Status: Not Started

Priority: Critical

Estimated Time: 3–5 Hours

---

# Objective

Configure Supabase, PostgreSQL, and Prisma for AVEX CRM.

The goal of this task is to establish a secure and production-ready database connection that will be used throughout the application.

Do not implement any business modules or database models in this task.

---

# Requirements

Configure the following:

- Supabase Project Connection
- PostgreSQL Connection
- Prisma ORM
- Prisma Client
- Environment Variables
- Database Utilities

Ensure everything is production-ready and follows best practices.

---

# Prisma Setup

Configure Prisma ORM.

Requirements:

- Initialize Prisma
- Configure PostgreSQL datasource
- Configure Prisma Client
- Enable Prisma Client generation
- Verify database connection

Do not create business models yet.

The schema should only contain the generator and datasource configuration.

---

# Supabase Setup

Configure Supabase for:

- Authentication (configuration only)
- Database Connection
- Storage (configuration only)

Create reusable utility files for:

- Client-side Supabase Client
- Server-side Supabase Client
- Middleware Supabase Client

Use the latest recommended Supabase SSR approach for Next.js App Router.

---

# Environment Variables

Verify and configure the following variables:

NEXT_PUBLIC_SUPABASE_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY

DATABASE_URL

DIRECT_URL

REDIS_URL

GEMINI_API_KEY

RESEND_API_KEY

WHATSAPP_ACCESS_TOKEN

WHATSAPP_PHONE_NUMBER_ID

Do not hardcode secrets anywhere in the project.

---

# Database Utilities

Create reusable database utilities.

Include:

- Prisma Client Singleton
- Database Connection Helper
- Error Handling
- Development/Production Configuration

Prevent multiple Prisma Client instances during development.

---

# Folder Structure

Organize database-related files clearly.

Suggested locations:

- prisma/
- src/lib/database/
- src/lib/supabase/

Keep responsibilities separated.

---

# Health Check

Create a simple database health check.

The application should be able to verify:

- Database connection
- Prisma connection
- Supabase connection

Display only basic success or failure information.

No sensitive information should be exposed.

---

# Logging

Log successful initialization during development.

Log connection failures clearly.

Do not expose credentials.

---

# Error Handling

Handle:

- Missing environment variables
- Database connection failures
- Prisma initialization failures
- Supabase initialization failures

Provide meaningful error messages for developers.

---

# Security

Ensure:

- Secrets are never exposed to the client.
- Server-only utilities remain server-only.
- Public and private environment variables are used correctly.

---

# Constraints

Do not create:

- Users
- Companies
- Roles
- Permissions
- Customers
- Leads
- Projects
- Employees
- Attendance
- Invoices
- Inventory
- API Endpoints
- Authentication Logic

Only configure the database foundation.

---

# Deliverables

- Prisma configured
- Supabase configured
- Database connection established
- Prisma Client configured
- Environment variables verified
- Database utilities created
- Connection health check implemented

---

# Acceptance Criteria

- Prisma generates successfully.
- Database connection works.
- Supabase client initializes successfully.
- No TypeScript errors.
- No ESLint errors.
- Environment variables are validated.
- No secrets are exposed.
- Project runs without configuration errors.

---

# Definition of Done

This task is complete when AVEX CRM has a fully configured and verified database foundation ready for authentication and future database models.