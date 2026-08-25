# Sprint 06 - Task 005
# AI Architecture & Provider Setup

Status: Completed
Priority: High

---

# Objective

Design and implement the foundational AI architecture for AVEX CRM.

This task is NOT about building every AI feature yet.

The goal is to create a clean, provider-independent AI layer that future AVEX features can use for:

- CSV data extraction
- PDF data extraction
- Customer extraction
- Lead extraction
- Document processing
- Data normalization
- CRM automation
- AI-assisted workflows

The architecture must allow the AI provider to be changed later without rewriting the entire CRM.

---

# IMPORTANT — AUDIT FIRST

Before writing code, inspect:

- Existing AI-related files
- Existing OpenAI/AI SDK dependencies
- Existing environment variables
- Existing file upload system
- Existing CSV processing
- Existing PDF processing
- Existing document utilities
- Existing CRM customer service
- Existing lead service
- Existing authentication
- Existing RBAC
- Existing background jobs
- Existing API structure
- Existing error handling
- Existing logging system

Determine what already exists.

DO NOT install a new AI SDK if an appropriate AI implementation already exists.

DO NOT create duplicate AI providers.

DO NOT replace working file-processing functionality unnecessarily.

---

# Architecture Goal

The application should follow this structure:

User / CRM Feature
        ↓
AI Service
        ↓
AI Provider Interface
        ↓
AI Provider
        ↓
Model
        ↓
Structured Result
        ↓
Validation
        ↓
CRM Service

The rest of AVEX CRM should NOT directly depend on a specific AI provider.

---

# Recommended Structure

Inspect the existing project structure first.

If these directories do not already exist, create an appropriate equivalent:

```text
apps/web/src/features/ai/
│
├── services/
│   ├── ai-service.ts
│   └── ai-provider-service.ts
│
├── providers/
│   └── [provider].ts
│
├── schemas/
│   ├── extraction-schema.ts
│   ├── customer-schema.ts
│   └── lead-schema.ts
│
├── types/
│   └── ai-types.ts
│
├── utils/
│   ├── ai-error-handler.ts
│   └── ai-response-parser.ts
│
└── index.ts