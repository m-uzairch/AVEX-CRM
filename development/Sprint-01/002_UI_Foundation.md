# Sprint 01 - Task 002

# UI Foundation & Design System

Status: Not Started

Priority: High

Estimated Time: 4–6 Hours

---

# Objective

Build the UI foundation for AVEX CRM.

The goal of this task is to create a reusable design system and application layout that every future page will use.

Do not implement business features such as CRM, Projects, Invoices, Employees, Attendance, or AI.

---

# Requirements

Create a clean and professional dashboard interface.

The UI should feel modern, minimal, and productivity-focused.

Inspiration:

- Linear
- Vercel Dashboard
- GitHub
- Stripe Dashboard

Avoid flashy effects, glassmorphism, and heavy animations.

Use subtle hover animations and loading transitions only.

---

# Dashboard Layout

Create the main application layout.

Include:

- Left Sidebar
- Top Navigation Bar
- Main Content Area

The layout should be responsive.

---

# Sidebar

Create a collapsible sidebar.

Include placeholder navigation items only.

Navigation:

- Dashboard
- CRM
- Projects
- Employees
- Attendance
- Invoices
- Inventory
- Reports
- Calendar
- Notifications
- Settings

Only create navigation.

Do not build these pages.

The active navigation item should be highlighted.

---

# Top Navigation

Create a top navigation bar.

Include:

- Page Title
- Search Bar (UI only)
- Theme Toggle
- Notification Icon
- User Profile Dropdown

The dropdown should contain placeholder items:

- Profile
- Settings
- Logout

No functionality required.

---

# Dashboard Page

Create a temporary dashboard page.

Include placeholder sections:

- Welcome Card
- Four Statistics Cards
- Recent Activity Card
- Upcoming Tasks Card
- Calendar Placeholder
- Quick Actions Placeholder

Use mock data.

---

# Design System

Create reusable UI components.

Include:

- Button
- Card
- Input
- Textarea
- Select
- Badge
- Avatar
- Table
- Modal
- Dropdown Menu
- Tooltip
- Tabs
- Breadcrumb
- Pagination
- Empty State

Use shadcn/ui where appropriate.

Customize only if necessary.

---

# Layout Components

Create reusable layout components.

Include:

- Sidebar
- Sidebar Item
- Top Navbar
- Page Header
- Section Header
- Content Container
- Dashboard Card

---

# Theme

Ensure Light Mode and Dark Mode work throughout the layout.

Theme selection should persist.

---

# Typography

Use a clean typography hierarchy.

Include styles for:

- Page Titles
- Section Titles
- Card Titles
- Paragraphs
- Labels
- Helper Text

Maintain consistent spacing.

---

# Icons

Use Lucide Icons.

Use consistent icon sizes.

---

# Loading States

Create reusable loading components.

Include:

- Spinner
- Skeleton Card
- Skeleton Table
- Skeleton Form
- Full Page Loader

---

# Empty States

Create reusable empty state components.

Include:

- Icon
- Title
- Description
- Action Button

---

# Error States

Create reusable error components.

Include:

- Error Card
- Retry Button
- Friendly Error Message

---

# Responsive Design

Support:

- Desktop
- Tablet
- Mobile

Sidebar should collapse automatically on smaller screens.

---

# Accessibility

Ensure:

- Keyboard navigation
- Proper labels
- Focus indicators
- Accessible buttons
- Accessible forms

---

# Constraints

Do not implement:

- Authentication Logic
- Database
- API Calls
- Business Logic
- CRM Features
- Projects
- Attendance
- Employees
- AI Features

Use placeholder content only.

---

# Deliverables

Create:

- Dashboard Layout
- Sidebar
- Top Navigation
- Dashboard Placeholder
- Reusable Layout Components
- Reusable UI Components
- Loading Components
- Empty State Components
- Error Components

---

# Acceptance Criteria

- Dashboard layout is fully responsive.
- Sidebar collapses correctly.
- Theme switching works.
- Navigation highlights active page.
- Components are reusable.
- Layout is clean and professional.
- No TypeScript errors.
- No ESLint errors.
- Code follows project architecture.

---

# Definition of Done

This task is complete when AVEX CRM has a polished, reusable UI foundation that all future modules can use without requiring redesign or major refactoring.