# 🏠 Home Service

> A modern web application for managing and booking home services — cleaning, plumbing, electrical, painting, pest control, appliance repair, HVAC, and more!

---

## 📋 Table of Contents

- [👥 Team](#-team)
- [🚀 Quick Start](#-quick-start)
- [📦 Prerequisites](#-prerequisites)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [💻 Available Scripts](#-available-scripts)
- [🗄️ Database Setup](#️-database-setup)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)

---

## 👥 Team

**Spring '26 Project**

| Name          |
| ------------- |
| Mustafizur    |
| Debottom      |
| Tahasin       |
| Nazmul        |
| Raka          |

---

## 🚀 Quick Start

> **New to programming?** No worries! Follow these steps and you'll have the project running in minutes.

### Step 1: Install Node.js

If you don't have Node.js installed, download it from [nodejs.org](https://nodejs.org/) (LTS version recommended).

To verify installation, open your terminal and run:

```bash
node -v
npm -v
```

You should see version numbers like `v20.x.x` and `10.x.x`.

### Step 2: Clone the Repository

```bash
git clone <your-repo-url>
cd Home-Service
```

### Step 3: Install Dependencies

Navigate to the `homeService` folder and install all required packages:

```bash
cd homeService
npm install
```

> ⏳ This may take a minute or two. It downloads all the libraries the project needs.

### Step 4: Set Up Environment Variables

The project needs Supabase credentials to connect to the backend. Create a `.env` file inside the `homeService` folder:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_ANON_KEY=your_supabase_anon_key
```

> 🔑 **Where do I get these?** Ask your team lead or check the Supabase dashboard at [supabase.com](https://supabase.com/).

### Step 5: Start the Development Server 🎉

```bash
npm run dev
```

You should see output like:

```
  VITE v8.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open **[http://localhost:5173/](http://localhost:5173/)** in your browser — and you're in! 🎊

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

| Tool      | Version | Download Link                              |
| --------- | ------- | ------------------------------------------ |
| Node.js   | 18+     | [nodejs.org](https://nodejs.org/)          |
| npm       | 9+      | Comes with Node.js                         |
| Git       | Any     | [git-scm.com](https://git-scm.com/)        |
| VS Code   | Any     | [code.visualstudio.com](https://code.visualstudio.com/) *(recommended)* |

---

## 🛠️ Tech Stack

| Category       | Technology                          |
| -------------- | ------------------------------------ |
| **Frontend**   | React 19 + TypeScript                |
| **Build Tool** | Vite 8                               |
| **Backend**    | Supabase (PostgreSQL)                |
| **Styling**    | Custom CSS                           |
| **Linting**    | ESLint 9 + TypeScript-ESLint         |
| **Optimization** | Babel + React Compiler            |
| **Package Manager** | npm                              |

---

## 📁 Project Structure

```
Home-Service/
│
├── Home Service/              # Legacy static files (CSS, HTML, JS, Images)
│   ├── CSS/
│   ├── Html/
│   ├── Image/
│   └── JS/
│
└── homeService/               # 🟢 Main application folder
    ├── src/                   # React source code
    │   ├── App.tsx            # Main app component (iframe container)
    │   ├── main.tsx           # React entry point
    │   └── *.css              # Styles
    │
    ├── public/                # Static files (HTML pages served here)
    ├── scripts/               # Utility & data import scripts
    ├── sql/                   # Database schema & migration scripts
    │
    ├── .env                   # Environment variables (Supabase config)
    ├── package.json           # Dependencies & scripts
    ├── vite.config.ts         # Vite configuration
    ├── tsconfig.json          # TypeScript configuration
    └── eslint.config.js       # ESLint configuration
```

---

## 💻 Available Scripts

Run these commands from inside the `homeService` folder:

| Command            | What It Does                                      |
| ------------------ | ------------------------------------------------- |
| `npm run dev`      | 🟢 Starts the development server (use this most!) |
| `npm run build`    | 📦 Builds the app for production                  |
| `npm run lint`     | 🔍 Checks code for errors & style issues          |
| `npm run preview`  | 👀 Previews the production build locally          |

---

## 🗄️ Database Setup

This project uses **Supabase** as its backend. The database includes:

### `offers` Table
Stores promotional offers and discounts.

| Column       | Type   | Description         |
| ------------ | ------ | ------------------- |
| offer_title  | text   | Offer name          |
| service_name | text   | Associated service  |
| discount     | number | Discount percentage |
| promo_code   | text   | Promo code          |
| valid_until  | date   | Expiration date     |
| times_used   | number | Usage count         |
| package_name | text   | Package reference   |
| created_at   | ts     | Auto timestamp      |

### `admin_profiles` Table
Manages admin users with role-based permissions and Row Level Security (RLS).

### `schedule` Table
Handles appointment scheduling functionality.

> 📖 SQL migration scripts are available in the `sql/` folder. Run these in your Supabase SQL Editor to set up tables.

---

## 🤝 Contributing

1. **Pull the latest changes:**
   ```bash
   git pull origin main
   ```

2. **Create a new branch** for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** and commit with a clear message:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push your branch** and create a Pull Request:
   ```bash
   git push origin feature/your-feature-name
   ```

### 📝 Commit Message Convention

- `feat:` — New feature
- `fix:` — Bug fix
- `docs:` — Documentation changes
- `style:` — Code style/formatting (no logic change)
- `refactor:` — Code refactoring
- `chore:` — Maintenance tasks

---

## ❓ Troubleshooting

### "Command not found" errors?
Make sure you're in the `homeService` directory before running `npm` commands.

### Port 5173 already in use?
Vite will automatically use the next available port (e.g., 5174). You can also kill the process using port 5173 and try again.

### Supabase connection errors?
- Double-check your `.env` file has the correct URL and anon key.
- Make sure there are **no extra spaces** around the `=` sign.
- Restart the dev server after changing `.env`.

### TypeScript errors?
Run `npm run lint` to catch issues early. Most IDEs (like VS Code) will highlight errors in real-time.

---

## 📝 License

This project is for educational purposes as part of the Spring '26 coursework.

---

<p align="center">Made with ❤️ by the Home Service Team</p>
