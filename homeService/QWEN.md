# Home Service - Project Context

## Project Overview

**Home Service** is a web application for a home services business (e.g., cleaning, plumbing, electrical, painting, pest control, appliance repair, HVAC). The project uses a hybrid architecture:

- **Frontend Shell**: React 19 + TypeScript + Vite application that serves static HTML pages via an iframe.
- **Static Pages**: Traditional HTML/CSS/JavaScript pages hosted under `public/home-service/` (not shown in folder listing but referenced in code).
- **Backend**: Supabase (PostgreSQL) for database, authentication, and real-time features.

The React app (`App.tsx`) acts primarily as a container that loads static HTML pages into an iframe, persisting the current page in `sessionStorage`.

## Tech Stack

| Category       | Technology                           |
| -------------- | ------------------------------------- |
| Framework      | React 19 + TypeScript                 |
| Build Tool     | Vite 8                                |
| Styling        | CSS (custom)                          |
| Backend/DB     | Supabase (PostgreSQL)                 |
| Linting        | ESLint 9 + typescript-eslint          |
| Compilation    | Babel (with React Compiler)           |
| Package Manager| npm                                   |

## Project Structure

```
homeService/
├── src/                    # React application source
│   ├── App.tsx             # Main app - iframe container for static pages
│   ├── App.css             # App styles
│   ├── main.tsx            # React entry point
│   ├── index.css           # Global styles
│   └── assets/             # Static assets
├── public/                 # Static files served as-is (HTML pages live here)
├── scripts/                # Utility scripts
│   ├── import-packages-to-supabase.mjs
│   └── import-services-to-supabase.mjs
├── sql/                    # Database migration/schema scripts
│   ├── admin_profiles.sql
│   ├── disable_rls_admin_profiles.sql
│   ├── disable_rls_schedule.sql
│   └── schedule_update_policy.sql
├── check-offer-table.js    # Script to verify Supabase offers table
├── OFFER_TABLE_STRUCTURE.md # Documentation for offers table schema
├── .env                    # Environment variables (Supabase URL & anon key)
├── vite.config.ts          # Vite configuration with React Compiler
├── tsconfig*.json          # TypeScript configuration
├── eslint.config.js        # ESLint configuration
└── package.json            # Dependencies and scripts
```

## Key Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Type-check and build for production
npm run lint      # Run ESLint
npm run preview   # Preview production build locally
```

## Database Schema

The project uses Supabase with the following known tables:

### `offers` Table
| Column       | Type   | Description              |
| ------------ | ------ | ------------------------ |
| offer_title  | text   | Offer name               |
| service_name | text   | Associated service       |
| discount     | number | Discount percentage      |
| promo_code   | text   | Promo code               |
| valid_until  | date   | Expiration date          |
| times_used   | number | Usage count              |
| package_name | text   | Package reference (null) |
| created_at   | ts     | Auto-generated timestamp |

### `admin_profiles` Table
Full admin user management with role-based permissions, defined in `sql/admin_profiles.sql`. Includes RLS policies for security.

### `schedule` Table
Referenced in SQL scripts for scheduling functionality.

## Architecture Notes

- The React app is a **minimal wrapper** — the actual UI lives in static HTML/JS/CSS pages under `public/home-service/`.
- Page navigation is handled via iframe `sessionStorage` persistence (`STORAGE_KEY = 'home-service-current-page'`).
- Default page: `/home-service/Html/Home.html`.
- Supabase client is configured via `.env` with `REACT_APP_SUPABASE_URL` and `REACT_APP_ANON_KEY`.
- Data import scripts exist for seeding packages and services into Supabase.

## Development Conventions

- **TypeScript**: Strict mode enabled via `tsconfig.app.json` and `tsconfig.node.json`.
- **ESLint**: Configured with React Hooks and React Refresh plugins. Can be extended with type-checked rules.
- **React Compiler**: Enabled via Babel plugin for automatic optimization.
- **Module Type**: ESM (`"type": "module"` in package.json).

## Security Notes

- `.env` contains Supabase credentials — **do not commit to version control**.
- Supabase RLS (Row Level Security) is enabled on tables with granular policies.
- The anon key in `.env` is a legacy JWT-based key; consider migrating to publishable keys (`sb_publishable_*`) for new development.
