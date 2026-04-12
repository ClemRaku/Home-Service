# Home-Service Project

## Project Overview

**Home-Service** is a comprehensive home service management web application that provides a complete platform for connecting homeowners with professional service providers (cleaning, plumbing, electrical, painting, pest control, appliance repair, HVAC).

**Project Start Date:** January 2026

The project has a **hybrid architecture** with two sub-projects:

1. **Static Site** (`Home Service/`) - Vanilla HTML/CSS/JavaScript pages
2. **React Wrapper** (`homeService/`) - React 19 + TypeScript + Vite application that loads static pages via iframe with Supabase backend

### Team Members
- Mustafizur
- Debottom
- Tahasin
- Nazmul
- Raka

### Team Goal
Our goal is to create a modern, user-friendly platform that simplifies the process of booking and managing home services. We're building a complete solution that connects homeowners with professional service providers, streamlining appointment scheduling, service tracking, and business management for all stakeholders.

### Git Branches
| Branch                | Purpose                                          |
| --------------------- | ------------------------------------------------ |
| `main`                | 🟢 Stable production branch — latest working state |
| `Backend`             | 🔧 Supabase backend setup, database schemas, API logic, and backend-related features |
| `Frontend`            | 🎨 Active frontend development — React pages, components, UI/UX work |
| `Debu-Frontend`       | 🧪 Debottom's experimental/frontend debugging branch for testing new features before merging to `Frontend` |

### Key Features

The application supports three main user roles:

1. **Customers** - Browse services, book appointments, track services, manage profiles and messages
2. **Employees/Service Providers** - Manage jobs, view earnings, track schedules, maintain profiles
3. **Administrators** - Manage customers, employees, services, packages, offers, and scheduling

## Project Structure

```
Home-Service/
├── Home Service/              # Static site (vanilla HTML/CSS/JS)
│   ├── CSS/                   # Stylesheets
│   ├── Html/                  # HTML pages
│   ├── Image/                 # Image assets
│   ├── JS/                    # JavaScript files
│   └── SUPABASE_AUTH.md       # Supabase authentication documentation
│
├── homeService/               # React wrapper + Supabase integration
│   ├── src/                   # React application source
│   │   ├── App.tsx            # Main app - iframe container
│   │   ├── App.css            # App styles
│   │   ├── main.tsx           # React entry point
│   │   └── index.css          # Global styles
│   ├── public/                # Static files (HTML pages served here)
│   ├── scripts/               # Data import scripts
│   │   ├── import-packages-to-supabase.mjs
│   │   └── import-services-to-supabase.mjs
│   ├── sql/                   # Database migration scripts
│   │   ├── admin_profiles.sql
│   │   ├── disable_rls_admin_profiles.sql
│   │   ├── disable_rls_schedule.sql
│   │   └── schedule_update_policy.sql
│   ├── check-offer-table.js   # Supabase verification script
│   ├── OFFER_TABLE_STRUCTURE.md
│   ├── .env                   # Supabase credentials
│   ├── vite.config.ts         # Vite configuration
│   ├── tsconfig*.json         # TypeScript configuration
│   ├── eslint.config.js       # ESLint configuration
│   └── package.json           # Dependencies and scripts
│
├── QWEN.md                    # This file
└── README.md
```

## Pages Included

### Public Pages
- **Home** - Landing page with services overview, testimonials, and CTAs
- **Services** - Service catalog
- **Packages** - Service packages display
- **Offers** - Special offers and promotions
- **About** - Company information
- **Contact** - Contact form and information
- **Login/SignUp** - Authentication pages

### Customer Portal
- **CustomerBoooking** - Service booking interface
- **CustomerProfile** - Customer profile management
- **CustomerTracker** - Service tracking
- **CustomerMessage** - Messaging system
- **CustomerSetting** - Account settings

### Employee Portal
- **EmployeeProfile** - Worker profile and credentials
- **EmployeeJobs** - Job management and tracking
- **EmployeeEarnings** - Income and payment history
- **EmployeeSchedule** - Work schedule management

### Admin Portal
- **Admin** - Admin dashboard
- **AdminProfile** - Admin profile
- **AdminCustomer** - Customer management
- **AdminEmployees** - Employee management
- **AdminServices** - Service management
- **AdminPackage** - Package management
- **AdminOffers** - Offers management
- **AdminScheduling** - Scheduling management

## Tech Stack

### Static Site (`Home Service/`)
| Category       | Technology                           |
| -------------- | ------------------------------------- |
| Markup         | HTML5                                 |
| Styling        | CSS3 (Grid, Flexbox, custom properties) |
| Scripting      | Vanilla JavaScript                    |
| Icons          | Lucide Icons (CDN)                    |
| Fonts          | Google Fonts (Poppins, Inter, Playfair Display) |

### React Wrapper (`homeService/`)
| Category       | Technology                           |
| -------------- | ------------------------------------- |
| Framework      | React 19 + TypeScript                 |
| Build Tool     | Vite 8                                |
| Backend/DB     | Supabase (PostgreSQL)                 |
| Linting        | ESLint 9 + typescript-eslint          |
| Compilation    | Babel (with React Compiler)           |
| Package Manager| npm                                   |

## Running the Project

### Option 1: Static Site (No Build Required)

1. **Direct File Access**: Open any HTML file in a browser
   ```
   Open: Home Service/Html/Home.html
   ```

2. **Using a Local Server** (Recommended):
   ```bash
   # Python
   cd "Home Service"
   python -m http.server 8000

   # Node.js
   npx http-server "Home Service"

   # VS Code Live Server
   # Right-click any HTML file → "Open with Live Server"
   ```

3. **Access**: `http://localhost:8000/Html/Home.html`

### Option 2: React Wrapper with Supabase

```bash
cd homeService
npm install          # Install dependencies (first time only)
npm run dev          # Start Vite dev server with HMR
npm run build        # Type-check and build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build locally
```

**Note**: The React wrapper requires Supabase credentials in `.env`:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_ANON_KEY=your_supabase_anon_key
```

## Architecture Notes

### Static Site
- Each page has its own dedicated CSS and JS file
- Lucide icons loaded from CDN and initialized with `lucide.createIcons()`
- External fonts loaded from Google Fonts CDN
- Mobile-first responsive design with breakpoints: 600px, 720px, 900px, 1100px

### React Wrapper
- The React app is a **minimal wrapper** — the actual UI lives in static HTML pages
- Page navigation handled via iframe with `sessionStorage` persistence (`STORAGE_KEY = 'home-service-current-page'`)
- Default page: `/home-service/Html/Home.html`
- Supabase client configured via `.env`
- Data import scripts exist for seeding packages and services into Supabase

## Design System

### Color Palette
- **Primary Teal**: `#0d9488`, `#0f978f`, `#0f766e`
- **Accent Orange**: `#f97316`, `#f7941d`
- **Background**: `#f4f6f7`, `#f8f9fa`, `#efefef`
- **Text**: `#1f2937`, `#111827`
- **Success Green**: `#4ade80`, `#16a34a`

### Typography
- Primary font: **Poppins** (all weights)
- Secondary font: **Inter** (UI elements)
- Display font: **Playfair Display** (headlines)

### UI Components
- Gradient sidebars with teal color scheme
- Card-based layouts with subtle shadows
- Rounded corners (12px-18px)
- Custom styled scrollbars
- Modal dialogs
- Toast notifications
- Filter pills and badges
- Toggle switches
- Responsive grids

## Development Conventions

### File Naming
- HTML files use PascalCase (e.g., `EmployeeProfile.html`)
- CSS and JS files match their corresponding HTML file names
- Assets are stored in dedicated folders (CSS, JS, Html, Image)

### Static Site (`Home Service/`)
- Each page has its own dedicated CSS and JS file
- CSS uses modern features like CSS Grid, Flexbox, and custom properties
- JavaScript files handle page-specific interactivity
- Sidebars collapse or become static on smaller screens

### React Wrapper (`homeService/`)
- **TypeScript**: Strict mode enabled via `tsconfig.app.json` and `tsconfig.node.json`
- **ESLint**: Configured with React Hooks and React Refresh plugins
- **React Compiler**: Enabled via Babel plugin for automatic optimization
- **Module Type**: ESM (`"type": "module"` in package.json)

### Styling Patterns
- Consistent use of `border-radius` (12px-18px for cards)
- Box shadows for depth (`0 12px 30px rgba(...)`)
- Gradient backgrounds for sidebars
- Custom scrollbar styling
- Smooth transitions for hover states

## Database Schema (Supabase)

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

## Entry Points

- **Static Site**: `Home Service/Html/Home.html`
- **React Wrapper**: `homeService/` → `npm run dev`
- **Login**: `Html/Login.html`
- **Sign Up**: `Html/SignUp.html`

## Dependencies

### Static Site
All dependencies loaded via CDN:
- **Lucide Icons**: `https://unpkg.com/lucide@latest`
- **Google Fonts**: Poppins, Inter, Playfair Display

### React Wrapper
See `homeService/package.json` for full dependency list.

## Version Control

The project uses Git for version control. Key files in `.gitignore`:
- `node_modules/`
- `*.local` files
- `.env` files (contains sensitive credentials)
- IDE configuration files (`.vscode/`, `.idea/`)
- Log files

## Security Notes

- `.env` contains Supabase credentials — **do not commit to version control**
- Supabase RLS (Row Level Security) is enabled on tables with granular policies
- The anon key in `.env` is a legacy JWT-based key; consider migrating to publishable keys (`sb_publishable_*`) for new development

## Future Improvements (Not Implemented)

Based on the current structure, potential enhancements could include:
- Full backend integration for form validation and submission
- Complete authentication system integration
- Payment gateway integration
- Real-time messaging system
- Advanced reporting and analytics
- Mobile app development
