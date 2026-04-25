# Gemini CLI Instructional Context

This file provides architectural context, development standards, and operational guidelines for the **Home Service** project. Use this as a foundational reference for all technical tasks.

## Project Overview

**Home Service** is a comprehensive service management platform transitioning from a legacy static site to a modern full-stack application. It facilitates the booking and management of various home maintenance services (cleaning, plumbing, electrical, etc.) through three distinct portals: Customer, Employee, and Admin.

### Core Architecture
- **Monorepo-style Hybrid:**
    - `Home Service/`: Legacy vanilla HTML/CSS/JS static site.
    - `homeService/`: Modern React 19 + TypeScript frontend built with Vite 8.
    - **Integration:** The React `App.tsx` currently acts as an iframe wrapper for the legacy pages, enabling a staged migration.
- **Backend:** Supabase (PostgreSQL) provides database storage, authentication, and Row-Level Security (RLS).
- **Database Schema:** 13 primary tables including `admin_profiles`, `customers`, `employees`, `bookings`, `services`, `packages`, and `package_services` (junction table).

## Technology Stack
- **Frontend:** React 19, TypeScript, Custom CSS3, Lucide Icons.
- **Build/Dev:** Vite 8, ESLint 9, `typescript-eslint`.
- **Database:** PostgreSQL (Supabase), `pg` (node-postgres) for migration scripts.
- **Runtime:** Node.js (LTS recommended).

## Building and Running

### React App (Full Experience)
Commands should be executed within the `homeService/` directory.

- **Install Dependencies:** `npm install`
- **Development Server:** `npm run dev` (Starts Vite on `http://localhost:5173`)
- **Type-Check & Build:** `npm run build`
- **Linting:** `npm run lint`

### Database Migrations
Custom scripts are available in `homeService/scripts/` to manage the Supabase schema.

- **Apply Schema Updates:** `npx ts-node scripts/migrate-db.ts` (Requires `DATABASE_URL` in `.env`)
- **Initial Schema:** Located at `homeService/sql/database_schema.sql`.

## Development Conventions

### Security & Credentials
- **Credential Safety:** Never commit `.env` files. Ensure `.gitignore` properly excludes local secrets.
- **RLS Enforcement:** Every table in the `public` schema must have Row-Level Security (RLS) enabled. Use `homeService/sql/secure_rls_policies.sql` as a baseline.
- **Database Triggers:** Automated processes (like `sync_service_performance`) are handled via PL/pgSQL functions.

### Coding Style
- **TypeScript:** Use strict typing. Avoid `any`. Prefer explicit interfaces for database rows.
- **Styling:** Adhere to the established design system (Primary Teal: `#0d9488`). Use CSS variables found in legacy and modern stylesheets.
- **Legacy Compatibility:** When modifying files in `homeService/public/home-service/`, maintain compatibility with vanilla JS and CDN-loaded libraries (e.g., Lucide, Supabase JS).

### Database Relationships
- **Normalization:** Prefer relational links via junction tables (e.g., `package_services`) over flat text descriptions for complex associations.
- **Naming Conventions:** Use `snake_case` for database columns and `camelCase` for TypeScript variables/functions.

## Key Files & Directories
- `homeService/sql/`: Contains the ground-truth database schema and RLS policies.
- `homeService/src/App.tsx`: The primary entry point and iframe router.
- `homeService/scripts/`: Utility scripts for data migration and schema synchronization.
- `homeService/public/home-service/JS/`: Core logic for the static pages that power much of the current functionality.
