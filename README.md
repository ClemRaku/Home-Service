# 🏠 Home Service

> A modern web application for managing and booking home services — cleaning, plumbing, electrical, painting, pest control, appliance repair, HVAC, and more!

---

## 👥 Meet Our Team

**Spring '26 Project | Started: January 2026**

We're a team of five developers working together to build a comprehensive home service management platform. Our mission is to create a seamless experience that connects homeowners with professional service providers while empowering businesses to manage their operations efficiently.

| Team Member  |
| ------------ |
| Mustafizur   |
| Debottom     |
| Tahasin      |
| Nazmul       |
| Raka         |

---

## 🎯 What We're Building

**Home Service** is a full-stack web application designed to revolutionize how people book and manage home maintenance services. 

### Our Goal
To create a modern, user-friendly platform that simplifies the process of booking and managing home services. We're building a complete solution that:
- 🏡 Connects homeowners with trusted service professionals
- 📅 Streamlines appointment scheduling and tracking
- 💼 Empowers service providers with powerful management tools
- 🎁 Showcases promotional offers and service packages
- 🔐 Provides role-based access control for different user types

### Key Features
- ✅ **Role-Based Access Control** — Admin, Employee, and Customer portals
- ✅ **Service Booking System** — Browse, select, and book home services
- ✅ **Appointment Management** — Schedule, track, and manage bookings
- ✅ **Promotional Offers** — View and manage discounts and promo codes
- ✅ **Employee Management** — Track jobs, earnings, and schedules
- ✅ **Admin Dashboard** — Comprehensive tools for managing customers, employees, services, and packages
- ✅ **Responsive Design** — Works seamlessly on desktop, tablet, and mobile devices

---

## 🌿 Git Branches

We use a branching strategy to organize our development work:

| Branch                | Purpose                                          | Status      |
| --------------------- | ------------------------------------------------ | ----------- |
| `main`                | 🟢 Stable production branch — latest working state | **Active**  |
| `Backend`             | 🔧 Supabase backend setup, database schemas, API logic, and backend-related features | Merged ✅ |
| `Frontend`            | 🎨 Active frontend development — React pages, components, UI/UX work | Active      |
| `Debu-Frontend`       | 🧪 Debottom's experimental/frontend debugging branch for testing new features before merging to `Frontend` | Active      |

---

## 🛠️ Tech Stack

We're using modern technologies to build a robust, scalable application:

| Category         | Technology                           |
| ---------------- | ------------------------------------- |
| **Languages**    | TypeScript, JavaScript, SQL           |
| **Frontend**     | React 19 + TypeScript                 |
| **Build Tool**   | Vite 8                                |
| **Backend/DB**   | Supabase (PostgreSQL)                 |
| **Styling**      | Custom CSS3 (Grid, Flexbox, Variables)|
| **Static Site**  | Vanilla HTML5, CSS3, JavaScript       |
| **Icons**        | Lucide Icons (CDN)                    |
| **Fonts**        | Google Fonts (Poppins, Inter, Playfair Display) |
| **Package Manager** | npm                                |
| **Linting**      | ESLint 9 + typescript-eslint          |
| **Version Control** | Git + GitHub                       |

---

## 🚀 How to Run This Project

**No programming experience required!** Follow these simple steps to get the application running on your computer.

### Option 1: Quick Start (Static Site) ⚡

The easiest way to see the application in action — no installation needed!

#### Method A: Open Directly in Browser
1. Navigate to the `Home Service` folder
2. Open the `Html` folder inside
3. Double-click `Home.html` to open it in your web browser

**That's it!** 🎉 You should now see the Home Service landing page.

#### Method B: Run a Local Server (Recommended)

For the best experience, run a simple local server:

**Using Python** (comes pre-installed on most computers):
```bash
# Open terminal/command prompt in the "Home Service" folder
cd "Home Service"

# Start the server
python -m http.server 8000
```

**Using Node.js** (if you have it installed):
```bash
# In the "Home Service" folder
npx http-server "Home Service"
```

**Using VS Code** (easiest for developers):
1. Install the "Live Server" extension in VS Code
2. Right-click any HTML file
3. Select "Open with Live Server"

Then open your browser and go to: **`http://localhost:8000/Html/Home.html`**

---

### Option 2: React App with Database (Full Experience) 🗄️

This option gives you the complete application with Supabase backend integration.

#### Step 1: Install Node.js
If you don't have it already:
1. Visit [nodejs.org](https://nodejs.org/)
2. Download and install the **LTS version** (recommended)
3. Verify installation by opening terminal/command prompt and typing:
   ```bash
   node --version
   ```

#### Step 2: Set Up the Project
```bash
# Navigate to the React app folder
cd homeService

# Install all required dependencies (first time only)
npm install
```

This might take a few minutes. You'll see a progress bar — just wait for it to complete! ✅

#### Step 3: Configure Database Credentials
The app uses **Supabase** as its backend (a cloud database service).

1. Create a file named `.env` in the `homeService` folder
2. Add these two lines (replace with your actual Supabase credentials):
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_ANON_KEY=your_supabase_anon_key
   ```

**Don't have Supabase credentials?** You can still run the app in demo mode — some features may be limited.

#### Step 4: Start the Application
```bash
# Start the development server
npm run dev
```

You should see a message like:
```
  VITE v8.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your browser and go to **`http://localhost:5173/`** 🎉

---

## 🗄️ Database Setup (If Supabase Expires)

The Supabase database runs on a free tier which can expire. If you need to set up a new database, follow these steps:

### Option A: Set Up a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new account or log in
2. Click **New Project** and fill in the details:
   - **Name**: Home Service (or any name you prefer)
   - **Database Password**: Set a strong password (save this!)
   - **Region**: Choose the closest region to you
3. Wait for the project to be created (this may take a few minutes)
4. Once ready, go to **Settings** → **API** in your Supabase dashboard
5. Copy your:
   - `Project URL`
   - `anon public` key
   - `service_role` key (for admin access)

### Option B: Use Another PostgreSQL Database

You can use any PostgreSQL database (e.g., Neon, Railway, Render, or a local PostgreSQL installation). Ensure you have:
- Database URL
- Ability to run SQL files

---

### Step 1: Upload the SQL Schema

#### Using Supabase SQL Editor:

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Open `homeService/sql/database_schema.sql` in a text editor
4. Copy and paste the entire contents into the Supabase SQL Editor
5. Click **Run** to execute the schema

#### Using psql (Command Line):

```bash
psql "your_postgres_connection_string" -f homeService/sql/database_schema.sql
```

#### Using pgAdmin or DBeaver:

1. Connect to your database
2. Right-click on your database → **Query Tool** (or **New Query**)
3. Open `homeService/sql/database_schema.sql`
4. Execute the script

---

### Step 2: (Supabase Only) Apply RLS Policies

If using Supabase, you should also apply the RLS policies for security:

1. In Supabase SQL Editor, create a **New Query**
2. Open `homeService/sql/secure_rls_policies.sql`
3. Copy and paste the contents
4. Click **Run**

---

### Step 3: Update Your `.env` File

Edit the `.env` file in the `homeService` folder:

```
# For Supabase:
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_ANON_KEY=your_anon_key_here

# For other PostgreSQL databases, use these instead:
REACT_APP_DB_HOST=your_database_host
REACT_APP_DB_PORT=5432
REACT_APP_DB_NAME=postgres
REACT_APP_DB_USER=postgres
REACT_APP_DB_PASSWORD=your_password_here
```

---

### Step 4: Restart the Application

```bash
# Stop the current server (Ctrl+C)
# Restart it
npm run dev
```

The application should now connect to your new database. 🎉

---

## 📂 Project Structure

```
Home-Service/
├── Home Service/              # 📄 Static site (vanilla HTML/CSS/JS)
│   ├── CSS/                   #   Stylesheets
│   ├── Html/                  #   HTML pages
│   ├── Image/                 #   Images and assets
│   └── JS/                    #   JavaScript files
│
├── homeService/               # ⚛️ React wrapper + Supabase
│   ├── src/                   #   React source code
│   ├── public/                #   Static files served by React
│   ├── scripts/               #   Database import scripts
│   └── sql/                   #   Database migration scripts
│
└── README.md                  # 📖 This file!
```

---

## 📱 User Roles

The application supports three types of users:

### 👤 Customers
- Browse available home services
- Book appointments
- Track service progress
- Manage profile and messages
- View booking history

### 👷 Service Providers (Employees)
- View assigned jobs
- Manage work schedule
- Track earnings
- Update profile information
- View job history

### 👨‍💼 Administrators
- Manage customer accounts
- Manage employee profiles
- Add/edit/remove services
- Create and manage packages
- Configure promotional offers
- Handle scheduling and assignments

---

## 🎨 Design System

### Colors
- **Primary Teal**: `#0d9488`, `#0f978f`, `#0f766e`
- **Accent Orange**: `#f97316`, `#f7941d`
- **Background**: `#f4f6f7`, `#f8f9fa`
- **Text**: `#1f2937`, `#111827`
- **Success Green**: `#4ade80`, `#16a34a`

### Typography
- **Primary Font**: Poppins
- **UI Font**: Inter
- **Headlines**: Playfair Display

---

## 🤝 Contributing

If you're part of the development team:
1. Work on your assigned branch (`Frontend`, `Backend`, or `Debu-Frontend`)
2. Test your changes thoroughly
3. Commit with clear, descriptive messages
4. Create a pull request to merge into `main`
5. Resolve any merge conflicts before merging

---

## 📝 Additional Resources

- [QWEN.md](./QWEN.md) - Detailed project documentation and development guidelines
- [SUPABASE_AUTH.md](./Home%20Service/SUPABASE_AUTH.md) - Supabase authentication setup
- [OFFER_TABLE_STRUCTURE.md](./homeService/OFFER_TABLE_STRUCTURE.md) - Database offer table schema

---

<p align="center">Made with ❤️ by the Home Service Team</p>
<p align="center"><i>Clement Raka De Costa | Spring '26</i></p>
