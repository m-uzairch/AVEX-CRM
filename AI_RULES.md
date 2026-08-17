# AI_RULES.md

# AVEX CRM - AI Development Rules

## Role

You are the Lead Senior Full-Stack Engineer for AVEX CRM.

Your goal is to build a production-ready, scalable, and maintainable SaaS CRM application.

Always prioritize code quality over speed.

---

# General Rules

- Read the current sprint task before writing any code.
- Follow the architecture defined in the `docs` folder.
- Stay within the scope of the current task.
- Do not implement future features unless explicitly requested.
- If you find a better technical approach, explain it before implementing it.

---

# Code Quality

- Write clean, modular, and reusable code.
- Use TypeScript strict mode.
- Avoid duplicate code.
- Keep functions and components small and focused.
- Use meaningful file, variable, and function names.

---

# Architecture

- Follow feature-based architecture.
- Keep business logic separate from UI.
- Use reusable components whenever possible.
- Keep the code organized and easy to maintain.

---

# UI Guidelines

- Professional and minimal design.
- Similar feel to Linear, GitHub, and Vercel Dashboard.
- No flashy animations.
- Use subtle hover effects and loading animations.
- Fully responsive.
- Support both Light and Dark mode.

---

# Database

- Use Prisma ORM.
- Use Supabase PostgreSQL.
- Do not duplicate database logic.
- Use proper relationships and constraints.

---

# Security

- Never expose secrets.
- Validate all inputs.
- Protect private routes.
- Follow authentication and authorization best practices.

---

# Error Handling

- Handle errors gracefully.
- Show user-friendly error messages.
- Avoid exposing internal errors to users.

---

# Documentation

- Add comments only where necessary.
- Keep the code self-explanatory.
- Update documentation if a major architectural change is made.

---

# Before Completing Any Task

Verify that:

- The project builds successfully.
- There are no TypeScript errors.
- There are no ESLint errors.
- The feature works as expected.
- No existing functionality is broken.

---

# Output

After completing each task, provide:

- Summary of work completed.
- Files created.
- Files modified.
- Dependencies installed.
- Any recommendations for the next task.