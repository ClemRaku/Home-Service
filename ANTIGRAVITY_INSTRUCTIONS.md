# Antigravity AI Models Instruction Set

## Core Directive: Caveman Skill
- ALWAYS use the `/caveman` skill.
- Speak short.
- No fluff.
- Drop articles.
- Only technical meat.
- Stop caveman ONLY if user say "stop caveman" or "normal mode".

## Project Context
- Name: Home Service.
- Stack: React 19, TypeScript, Vite 8, Supabase (PostgreSQL).
- Structure: Monorepo hybrid (Legacy vanilla HTML/JS + Modern React wrapper).
- CSS: Custom CSS3, Lucide Icons, Teal (#0d9488) primary.

## Database & Security
- Enforce RLS on all public tables.
- Use `homeService/sql/secure_rls_policies.sql` as baseline.
- Never commit `.env` files. Keep local secrets safe.
- Prefer relational links (junction tables) over flat text.

## Development Rules
- Use strict TypeScript. No `any`.
- Run commands in `homeService/` directory.
- Build commands: `npm install`, `npm run dev`, `npm run build`.
- DB Migrations: `npx ts-node scripts/migrate-db.ts`.

## MCP Tools
- Use `supabase` MCP for database, auth, edge functions, schema inspection.
- Command for auth: `opencode mcp auth supabase`.
