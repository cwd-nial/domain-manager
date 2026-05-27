# Technical Specification — Domain Employee Manager

## 1. Overview

A Next.js application for managing employees, teams, roles, and positions within a domain. Publicly accessible but gated behind credential-based authentication via better-auth. The main view features two interactive hierarchy trees: one team-centric, one employee-centric.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router), TypeScript |
| Styling | CSS Modules (per-component `.module.css` files) |
| Auth | better-auth (credentials provider) |
| Database | SQLite via `better-sqlite3` |
| ORM | Drizzle ORM + Drizzle Kit (migrations) |
| Validation | Zod |
| Runtime | Node.js 20+ |

---

## 3. Database Schema

### 3.1 Core tables

**`users`** — managed by better-auth
```
id, email, password_hash, name, created_at
```

**`employees`**
```
id           TEXT PK
name         TEXT NOT NULL
email        TEXT UNIQUE
phone        TEXT
avatar_url   TEXT
manager_id   TEXT FK → employees.id (nullable, self-ref)
created_at   DATETIME
updated_at   DATETIME
```

**`teams`**
```
id           TEXT PK
name         TEXT NOT NULL
description  TEXT
parent_id    TEXT FK → teams.id (nullable, self-ref)
created_at   DATETIME
updated_at   DATETIME
```

**`employee_teams`** (many-to-many)
```
employee_id  TEXT FK → employees.id
team_id      TEXT FK → teams.id
PRIMARY KEY (employee_id, team_id)
```

**`roles`** — seeded from fixed list
```
id    TEXT PK
name  TEXT UNIQUE NOT NULL
```

Values: `Frontend developer`, `Backend developer`, `Fullstack developer`, `QA engineer`, `Product Owner`, `UX designer`

**`positions`** — seeded from fixed list
```
id    TEXT PK
name  TEXT UNIQUE NOT NULL
```

Values: `Domain Lead`, `Solution Architect`, `Team Lead`, `Engineering Lead`, `Developer`, `PO`, `QA`, `UX`

**`employee_roles`** (many-to-many)
```
employee_id  TEXT FK → employees.id
role_id      TEXT FK → roles.id
PRIMARY KEY (employee_id, role_id)
```

**`employee_positions`** (many-to-many)
```
employee_id   TEXT FK → employees.id
position_id   TEXT FK → positions.id
PRIMARY KEY (employee_id, position_id)
```

### 3.2 Self-referencing hierarchy strategy

Both `employees` and `teams` use an **adjacency list** pattern (a `manager_id` / `parent_id` self-reference). This is sufficient for domains of typical size and is easy to query recursively with SQLite's CTE support:

```sql
WITH RECURSIVE emp_tree AS (
  SELECT id, name, manager_id, 0 AS depth
  FROM employees WHERE manager_id IS NULL
  UNION ALL
  SELECT e.id, e.name, e.manager_id, t.depth + 1
  FROM employees e JOIN emp_tree t ON e.manager_id = t.id
)
SELECT * FROM emp_tree;
```

---

## 4. API Routes

All routes live under `app/api/`. Every route (except auth endpoints) is protected by a session check middleware.

| Method | Path | Description |
|---|---|---|
| GET | `/api/employees` | List all employees (with roles, positions, teams) |
| POST | `/api/employees` | Create employee |
| GET | `/api/employees/[id]` | Get single employee |
| PUT | `/api/employees/[id]` | Update employee |
| DELETE | `/api/employees/[id]` | Delete employee |
| GET | `/api/employees/tree` | Return full hierarchy as nested JSON |
| GET | `/api/teams` | List all teams |
| POST | `/api/teams` | Create team |
| GET | `/api/teams/[id]` | Get single team |
| PUT | `/api/teams/[id]` | Update team |
| DELETE | `/api/teams/[id]` | Delete team |
| GET | `/api/teams/tree` | Return full team hierarchy as nested JSON |
| GET | `/api/roles` | List available roles (static) |
| GET | `/api/positions` | List available positions (static) |
| POST | `/api/auth/[...all]` | better-auth catch-all handler |

---

## 5. Application Pages & Routes

```
app/
├── (auth)/
│   └── login/
│       └── page.tsx          ← public login page
├── (app)/
│   ├── layout.tsx            ← session guard + nav shell
│   ├── page.tsx              ← main page: dual hierarchy view
│   ├── employees/
│   │   ├── page.tsx          ← employee list + search
│   │   ├── new/page.tsx      ← create employee form
│   │   └── [id]/
│   │       ├── page.tsx      ← employee detail
│   │       └── edit/page.tsx ← edit employee form
│   └── teams/
│       ├── page.tsx          ← team list
│       ├── new/page.tsx      ← create team form
│       └── [id]/
│           ├── page.tsx      ← team detail + members
│           └── edit/page.tsx ← edit team form
```

---

## 6. Key Components

**`HierarchyTree`** — reusable collapsible tree component. Accepts a `TreeNode[]` prop and renders recursive nodes. Used for both the employee tree and team tree. Each node is expandable/collapsible, shows badges for roles/positions, and links to the detail page.

**`EmployeeForm`** — shared create/edit form. Fields: name, email, phone, avatar URL, manager (searchable select of employees), team memberships (multi-select), roles (multi-checkbox), positions (multi-checkbox).

**`TeamForm`** — create/edit form for teams. Fields: name, description, parent team (select).

**`BadgeGroup`** — renders a horizontal list of pill badges for roles and positions, with consistent colour coding (e.g. purple for roles, teal for positions).

**`SessionGuard`** — layout-level server component that checks the better-auth session and redirects to `/login` if unauthenticated.

---

## 7. Authentication

better-auth is configured with the **credentials provider** only. No OAuth in scope.

- Session is stored in the SQLite database (better-auth manages its own `session` and `account` tables).
- `middleware.ts` at the root intercepts all `/(app)` routes and validates the session cookie.
- The login page is the only public route. All other pages require a valid session.
- Password hashing is handled internally by better-auth (argon2 or bcrypt depending on version).

Configuration sketch:
```ts
// lib/auth.ts
import { betterAuth } from "better-auth";
import { db } from "./db";

export const auth = betterAuth({
  database: { db, type: "sqlite" },
  emailAndPassword: { enabled: true },
});
```

---

## 8. Main Page — Dual Hierarchy View

The home page (`/`) renders two side-by-side panels:

**Left panel — Team hierarchy**: the full team tree, showing each team's name, member count, and sub-teams. Clicking a team expands it and shows direct members with their positions.

**Right panel — Employee hierarchy**: the reporting-line tree rooted at employees with no manager. Each node shows name, primary role badges, and position badges. Supports expand/collapse per node.

Both trees are rendered client-side after an initial server-side data fetch. A search/filter bar sits above each panel to filter visible nodes by name.

---

## 9. Project Structure

```
domain-manager/
├── app/
│   ├── (auth)/login/
│   ├── (app)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── employees/
│   │   └── teams/
│   └── api/
│       ├── employees/
│       ├── teams/
│       ├── roles/
│       ├── positions/
│       └── auth/[...all]/
├── components/
│   ├── HierarchyTree/
│   ├── EmployeeForm/
│   ├── TeamForm/
│   └── BadgeGroup/
├── lib/
│   ├── auth.ts
│   ├── db.ts              ← Drizzle client singleton
│   └── validations.ts     ← Zod schemas
├── drizzle/
│   ├── schema.ts          ← all table definitions
│   ├── migrations/
│   └── seed.ts            ← seed roles + positions
├── middleware.ts
└── drizzle.config.ts
```

---

## 10. Data Constraints & Business Rules

- An employee's `manager_id` must not create a cycle (validate server-side before save).
- A team's `parent_id` must not create a cycle (same).
- Deleting an employee who is a manager of others should either be blocked or reassign their reports (configurable; blocking is safer as a default).
- Deleting a team that has sub-teams should be blocked until sub-teams are reassigned or deleted.
- An employee can belong to multiple teams, hold multiple roles, and hold multiple positions simultaneously.
- Roles and positions are fixed enumerations managed via seeded data — they cannot be created or deleted through the UI.

---

## 11. Development & Deployment

```bash
# Install
pnpm install

# DB migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
pnpm tsx drizzle/seed.ts

# Dev
pnpm dev

# Build
pnpm build && pnpm start
```

Environment variables needed:
```
BETTER_AUTH_SECRET=<random 32+ char string>
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=./domain.db
```

The app can be deployed to any Node.js host (Railway, Render, a VPS). SQLite is file-based, so ensure the database file path is on a persistent volume in production.

---

This spec covers everything needed to begin implementation. The clearest starting point would be: schema + migrations → better-auth setup → API routes → tree components → main page. Let me know if you'd like me to start generating the actual code for any of these layers.