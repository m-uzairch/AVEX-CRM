# Components Directory (`src/components`)

This directory contains shared, presentational UI components that are decoupled from specific business domains.

- `ui/`: Base UI primitives (Buttons, Cards, Inputs, Skeletons, Modals). Built using Radix UI primitives and styled with Tailwind CSS variables.
- `loading/`: Loading skeletons, page spinners, and layout placeholders.

**Rule**: Components in this directory must be domain-agnostic. Business-specific UI components belong inside their respective feature folder in `src/features/`.
