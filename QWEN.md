# Home-Service Project

## Project Overview

**Home-Service** is a comprehensive home service management web application built with vanilla HTML, CSS, and JavaScript. The project was developed as part of the Spring 2026 semester and provides a complete platform for connecting homeowners with professional service providers.

### Team Members
- Mustafizur
- Debottom
- Tahasin
- Nazmul
- Raka

### Key Features

The application supports three main user roles:

1. **Customers** - Browse services, book appointments, track services, manage profiles and messages
2. **Employees/Service Providers** - Manage jobs, view earnings, track schedules, maintain profiles
3. **Administrators** - Manage customers, employees, services, packages, offers, and scheduling

### Project Structure

```
Home-Service/
├── Home Service/
│   ├── CSS/          # Stylesheets for all pages
│   ├── Html/         # HTML pages
│   ├── Image/        # Image assets
│   └── JS/           # JavaScript files for interactivity
├── .gitignore
└── README.md
```

### Pages Included

#### Public Pages
- **Home** - Landing page with services overview, testimonials, and CTAs
- **Services** - Service catalog
- **Packages** - Service packages display
- **Offers** - Special offers and promotions
- **About** - Company information
- **Contact** - Contact form and information
- **Login/SignUp** - Authentication pages

#### Customer Portal
- **CustomerBoooking** - Service booking interface
- **CustomerProfile** - Customer profile management
- **CustomerTracker** - Service tracking
- **CustomerMessage** - Messaging system
- **CustomerSetting** - Account settings

#### Employee Portal
- **EmployeeProfile** - Worker profile and credentials
- **EmployeeJobs** - Job management and tracking
- **EmployeeEarnings** - Income and payment history
- **EmployeeSchedule** - Work schedule management

#### Admin Portal
- **Admin** - Admin dashboard
- **AdminProfile** - Admin profile
- **AdminCustomer** - Customer management
- **AdminEmployees** - Employee management
- **AdminServices** - Service management
- **AdminPackage** - Package management
- **AdminOffers** - Offers management
- **AdminScheduling** - Scheduling management
- **AdminServices** - Services configuration

## Technologies Used

- **HTML5** - Markup structure
- **CSS3** - Styling with CSS Grid, Flexbox, custom properties, gradients, and animations
- **JavaScript (Vanilla)** - Client-side interactivity
- **Lucide Icons** - Icon library for UI elements
- **Google Fonts** - Typography (Poppins, Inter, Playfair Display)

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

## Building and Running

This is a static website project with no build step required.

### How to Run

1. **Direct File Access**: Simply open any HTML file in a web browser
   ```
   Open: Home Service/Html/Home.html
   ```

2. **Using a Local Server** (Recommended for development):
   ```bash
   # Using Python
   cd "Home Service"
   python -m http.server 8000
   
   # Using Node.js (if http-server is installed)
   npx http-server "Home Service"
   
   # Using VS Code Live Server extension
   # Right-click any HTML file → "Open with Live Server"
   ```

3. **Access**: Navigate to `http://localhost:8000/Html/Home.html`

## Development Conventions

### File Naming
- HTML files use PascalCase (e.g., `EmployeeProfile.html`)
- CSS and JS files match their corresponding HTML file names
- Assets are stored in dedicated folders (CSS, JS, Html, Image)

### Code Structure
- Each page has its own dedicated CSS and JS file
- Lucide icons are loaded from CDN and initialized with `lucide.createIcons()`
- External fonts loaded from Google Fonts CDN
- CSS uses modern features like CSS Grid, Flexbox, and custom properties
- JavaScript files handle page-specific interactivity

### Responsive Design
- Mobile-first approach with media queries
- Breakpoints: 600px, 720px, 900px, 1100px
- Flexbox and Grid for flexible layouts
- Sidebars collapse or become static on smaller screens

### Styling Patterns
- Consistent use of `border-radius` (12px-18px for cards)
- Box shadows for depth (`0 12px 30px rgba(...)`)
- Gradient backgrounds for sidebars
- Custom scrollbar styling
- Smooth transitions for hover states

## Entry Points

- **Landing Page**: `Html/Home.html`
- **Login**: `Html/Login.html`
- **Sign Up**: `Html/SignUp.html`

## Dependencies

All dependencies are loaded via CDN:
- **Lucide Icons**: `https://unpkg.com/lucide@latest`
- **Google Fonts**: Poppins, Inter, Playfair Display

No npm dependencies required for the core application (root `package.json` only contains Qwen Code SDK for development tools).

## Version Control

The project uses Git for version control. Key files in `.gitignore`:
- `node_modules/`
- `*.local` files
- IDE configuration files (`.vscode/`, `.idea/`)
- Log files

## Future Improvements (Not Implemented)

Based on the current static structure, potential enhancements could include:
- Backend integration (Node.js, PHP, etc.)
- Database connectivity for user data
- API integration for real-time features
- Form validation and submission
- Authentication system
- Payment gateway integration
- Real-time messaging system
