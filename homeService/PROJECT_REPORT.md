# Project Report: homeService

## Structure
- `public/home-service/`: Main meat. Legacy static site.
  - `Html/`: Page bones.
  - `CSS/`: Skin. Teal colors.
  - `JS/`: Brain. Talk to Supabase.
- `scripts/`: Tools. Migrate DB. Import data.
- `sql/`: DB blueprint. RLS rules.
- `src/`: React shell. Iframe wrapper for legacy pages.

## Libraries & Functions
- **Frontend:** React 19, Vite 8, TypeScript.
- **Icons:** Lucide.
- **Backend:** Supabase (Postgres).
- **Communication:** `fetch` API in JS.
- **Scripts:** `pg` (node-postgres), `dotenv`.

## Supabase Connection
- Link: `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
- Source: `public/home-service/JS/config.js` for legacy. `.env` for scripts.

## Data Flow

### Send Data
- Files: `contact.js`, `signup.js`, `service.js`, `packages.js`, `offers.js`.
- Action: `fetch(URL/rest/v1/TABLE, { method: 'POST/PATCH' })`.
- Auth: `apikey` and `Authorization` headers.

### Fetch Data
- Files: `home.js`, `service.js`, `packages.js`, `offers.js`, `Admin*.js`.
- Action: `fetch(URL/rest/v1/TABLE?select=*)`.
- Logic: Map JSON to DOM elements in `render*` functions.

### React Integration
- `App.tsx`: Load `Home.html` in iframe. Smooth transitions between pages.
