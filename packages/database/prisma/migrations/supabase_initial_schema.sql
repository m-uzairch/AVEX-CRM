-- =====================================================================
-- AVEX CRM — Production-Ready Supabase PostgreSQL Database Schema
-- Includes: Enums, 10 Core Tables, Foreign Keys, Indexes & Seed Data
-- Instructions: Copy and paste this script directly into Supabase SQL Editor
-- =====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DO $$ BEGIN
    CREATE TYPE "BusinessType" AS ENUM ('DIGITAL', 'PHYSICAL', 'BOTH');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CompanyStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'INACTIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLES DEFINITION

-- 3.1 Companies Table (Multi-tenant Workspaces)
CREATE TABLE IF NOT EXISTS "companies" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "businessType" "BusinessType" NOT NULL DEFAULT 'DIGITAL',
    "logo" TEXT,
    "timezone" VARCHAR(100) NOT NULL DEFAULT 'UTC',
    "currency" VARCHAR(10) NOT NULL DEFAULT 'USD',
    "status" "CompanyStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3.2 Users Table
CREATE TABLE IF NOT EXISTS "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "supabaseUserId" VARCHAR(255) UNIQUE NOT NULL,
    "companyId" UUID NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
    "fullName" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "avatar" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLogin" TIMESTAMP(3) WITH TIME ZONE,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3.3 User Profiles Table
CREATE TABLE IF NOT EXISTS "user_profiles" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID UNIQUE NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "phone" VARCHAR(50),
    "address" TEXT,
    "jobTitle" VARCHAR(150),
    "bio" TEXT,
    "profileImage" TEXT,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3.4 Roles Table
CREATE TABLE IF NOT EXISTS "roles" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) UNIQUE NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3.5 Permissions Table
CREATE TABLE IF NOT EXISTS "permissions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "code" VARCHAR(100) UNIQUE NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "group" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3.6 Role Permissions Junction Table
CREATE TABLE IF NOT EXISTS "role_permissions" (
    "roleId" UUID NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
    "permissionId" UUID NOT NULL REFERENCES "permissions"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("roleId", "permissionId")
);

-- 3.7 User Roles Junction Table
CREATE TABLE IF NOT EXISTS "user_roles" (
    "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "roleId" UUID NOT NULL REFERENCES "roles"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("userId", "roleId")
);

-- 3.8 Invitations Table
CREATE TABLE IF NOT EXISTS "invitations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) NOT NULL,
    "role" VARCHAR(100) NOT NULL,
    "companyId" UUID NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
    "token" VARCHAR(255) UNIQUE NOT NULL,
    "expiresAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "createdById" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3.9 Sessions Table
CREATE TABLE IF NOT EXISTS "sessions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "deviceIp" VARCHAR(50),
    "userAgent" TEXT,
    "lastActivity" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3.10 Activity Logs Table
CREATE TABLE IF NOT EXISTS "activity_logs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "companyId" UUID NOT NULL REFERENCES "companies"("id") ON DELETE CASCADE,
    "action" VARCHAR(100) NOT NULL,
    "module" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS "idx_users_companyId" ON "users"("companyId");
CREATE INDEX IF NOT EXISTS "idx_users_email" ON "users"("email");
CREATE INDEX IF NOT EXISTS "idx_users_supabaseUserId" ON "users"("supabaseUserId");

CREATE INDEX IF NOT EXISTS "idx_invitations_companyId" ON "invitations"("companyId");
CREATE INDEX IF NOT EXISTS "idx_invitations_token" ON "invitations"("token");
CREATE INDEX IF NOT EXISTS "idx_invitations_email" ON "invitations"("email");

CREATE INDEX IF NOT EXISTS "idx_sessions_userId" ON "sessions"("userId");
CREATE INDEX IF NOT EXISTS "idx_sessions_expiresAt" ON "sessions"("expiresAt");

CREATE INDEX IF NOT EXISTS "idx_activity_logs_companyId" ON "activity_logs"("companyId");
CREATE INDEX IF NOT EXISTS "idx_activity_logs_userId" ON "activity_logs"("userId");
CREATE INDEX IF NOT EXISTS "idx_activity_logs_timestamp" ON "activity_logs"("timestamp");

-- 5. INITIAL SEED DATA (Default Permissions & Roles)

-- Insert Atomic Permissions
INSERT INTO "permissions" ("id", "code", "name", "group") VALUES
(gen_random_uuid(), 'MANAGE_COMPANY', 'Manage Company Profile', 'Administration'),
(gen_random_uuid(), 'MANAGE_BILLING', 'Manage Subscription & Billing', 'Administration'),
(gen_random_uuid(), 'MANAGE_USERS', 'User & Role Management', 'Administration'),
(gen_random_uuid(), 'MANAGE_SETTINGS', 'Company Settings', 'Administration'),
(gen_random_uuid(), 'MANAGE_CRM', 'CRM & Customer Deals', 'Operations'),
(gen_random_uuid(), 'MANAGE_PROJECTS', 'Projects & Tasks', 'Operations'),
(gen_random_uuid(), 'MANAGE_EMPLOYEES', 'Employee Directory', 'Operations'),
(gen_random_uuid(), 'MANAGE_ATTENDANCE', 'Attendance Tracking', 'Operations'),
(gen_random_uuid(), 'MANAGE_INVOICES', 'Invoices & Billing', 'Finance'),
(gen_random_uuid(), 'MANAGE_INVENTORY', 'Inventory & Products', 'Logistics'),
(gen_random_uuid(), 'MANAGE_REPORTS', 'Reports & Business Intelligence', 'Analytics'),
(gen_random_uuid(), 'VIEW_CLIENT_PORTAL', 'Client Portal View', 'Portal')
ON CONFLICT ("code") DO NOTHING;

-- Insert System Roles
INSERT INTO "roles" ("id", "name", "description", "isSystem") VALUES
(gen_random_uuid(), 'Company Owner', 'Full access to entire company workspace and settings', TRUE),
(gen_random_uuid(), 'Admin', 'Full operational access to CRM, Projects, Invoices, and HR', TRUE),
(gen_random_uuid(), 'Employee', 'Staff access to assigned projects, tasks, and attendance', TRUE),
(gen_random_uuid(), 'Client', 'Client portal view for assigned projects and invoices', TRUE)
ON CONFLICT ("name") DO NOTHING;

-- Done!
