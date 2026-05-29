# Domain Employee Manager

A Next.js application for managing employees, teams, roles, and positions within a domain. Features interactive hierarchy trees for both reporting lines and team structures, protected behind credential-based authentication.

## Features

- **Dual hierarchy view** — side-by-side employee reporting tree and team structure tree on the home page
- **Employee management** — create, view, edit, and delete employees with support for manager assignment, team memberships, roles, and positions
- **Team management** — create nested team hierarchies with sub-team support
- **Role & position tracking** — assign predefined roles (e.g. Frontend Developer, DevOps) and positions (e.g. Team Lead, Domain Lead) to employees
- **Authentication** — credential-based login via better-auth; all pages except `/login` require a valid session
- **Dark mode** — toggle between light and dark themes

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**, **TypeScript 5**
- **Tailwind CSS v4**
- **Drizzle ORM** + **@libsql/client** (SQLite)
- **better-auth** (credentials provider)
- **Zod v4**

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file:

```env
BETTER_AUTH_SECRET=<random 32+ character string>
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=./domain.db
```

### 3. Run database migrations and seed

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
npx tsx drizzle/seed.ts
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. You will be redirected to `/login` until authenticated.

## Available Scripts

```bash
npm run dev      # Start dev server (Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Project Structure

```
app/
├── (auth)/login/          # Public login page
└── (app)/
    ├── page.tsx           # Home: dual hierarchy view
    ├── employees/         # List, create, view, edit employees
    └── teams/             # List, create, view, edit teams
components/
├── HierarchyTree/         # Collapsible tree component
├── EmployeeForm/          # Shared create/edit form
├── TeamForm/              # Team create/edit form
└── BadgeGroup/            # Role/position pill badges
drizzle/
├── schema.ts              # Database table definitions
├── migrations/            # Auto-generated migration files
└── seed.ts                # Seeds roles and positions
lib/
├── auth.ts                # better-auth configuration
├── db.ts                  # Drizzle client singleton
└── validations.ts         # Zod schemas
```

## Deployment

The app runs on any Node.js host (Railway, Render, VPS). Since the database is file-based SQLite, ensure `DATABASE_URL` points to a path on a **persistent volume** in production.
