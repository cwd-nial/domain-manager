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
npm run dev        # Start dev server (Turbopack)
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm test           # Run unit tests (single pass)
npm run test:watch # Run unit tests in watch mode
```

## Testing

Unit tests are written with [Vitest](https://vitest.dev/) and cover all key application logic.

```bash
npm test
```

### What's tested

| Area                                                             | Files                                    |
| ---------------------------------------------------------------- | ---------------------------------------- |
| Name formatting (`formatName`, `sortKey`)                        | `tests/lib/formatName.test.ts`           |
| Team color assignment (hash + overrides)                         | `tests/lib/teamColors.test.ts`           |
| Hierarchy cycle detection (`wouldCreateCycle`)                   | `tests/lib/cycles.test.ts`               |
| Employee API routes (list, create, detail, update, delete, tree) | `tests/api/employees*.test.ts`           |
| Team API routes (list, create, detail, update, delete, tree)     | `tests/api/teams*.test.ts`               |
| `useDarkMode` hook (localStorage + classList)                    | `tests/hooks/useDarkMode.test.ts`        |
| `NameFormatProvider` context (localStorage + toggle)             | `tests/hooks/nameFormatContext.test.tsx` |

API route tests use mocked database and session dependencies — no running database is required.

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
