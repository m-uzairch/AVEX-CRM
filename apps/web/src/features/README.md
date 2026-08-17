# Features Directory (`src/features`)

This directory houses all domain-specific business features. Each subfolder represents a self-contained module of the AVEX CRM platform (e.g., `customers`, `leads`, `projects`, `invoices`, `attendance`, `inventory`).

## Standard Feature Folder Structure:

```
src/features/<feature-name>/
├── components/     # UI components specific to this feature
├── hooks/          # React hooks specific to this feature
├── services/       # Business logic and service functions
├── repositories/   # Database access layer for this feature
├── schemas/        # Zod validation schemas
├── types/          # Feature-specific TypeScript definitions
├── actions/        # Server actions or API call handlers
└── tests/          # Feature unit & integration tests
```

**Rule**: Features must not import internal components from other features. Inter-feature communication must happen strictly via services.
