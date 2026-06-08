# Technical Specification — Domain Employee Manager

## 1. Overview

A Next.js application for managing employees, teams, roles, and positions within a domain. Publicly accessible but gated behind credential-based authentication via better-auth. New users require admin approval before gaining access. The main view features two interactive hierarchy trees: one team-centric, one employee-centric.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.6 (App Router), TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Auth | better-auth (credentials provider) |
| Database | SQLite via `@libsql/client` |
| ORM | Drizzle ORM + Drizzle Kit (migrations) |
| Validation | Zod v4 |
| Testing | Vitest |
| Runtime | Node.js 20+ |

---

## 3. Database Schema

### 3.1 Core tables

**Auth tables** — managed by better-auth

better-auth owns four base tables. Two fields are extended on `user` via `additionalFields`:

| Table | Key columns |
|---|---|
| `user` | `id`, `name`, `email`, `emailVerified`, `image`, `isAdmin` (boolean, default false), `registrationStatus` (text: pending\|approved\|rejected, default pending), `createdAt`, `updatedAt` |
| `session` | `id`, `token`, `userId`, `expiresAt`, `ipAddress`, `userAgent`, `createdAt`, `updatedAt` |
| `account` | `id`, `accountId`, `providerId`, `userId`, `password`, `createdAt`, `updatedAt` |
| `verification` | `id`, `identifier`, `value`, `expiresAt`, `createdAt`, `updatedAt` |

**`employees`**
```
id           TEXT PK
firstName    TEXT NOT NULL
lastName     TEXT NOT NULL
email        TEXT UNIQUE
phone        TEXT
avatarUrl    TEXT
managerId    TEXT FK → employees.id (nullable, self-ref)
createdAt    DATETIME
updatedAt    DATETIME
```

**`teams`**
```
id           TEXT PK
name         TEXT NOT NULL
description  TEXT
parentId     TEXT FK → teams.id (nullable, self-ref)
createdAt    DATETIME
updatedAt    DATETIME
```

**`employeeTeams`** (many-to-many)
```
employeeId   TEXT FK → employees.id
teamId       TEXT FK → teams.id
PRIMARY KEY (employeeId, teamId)
```

**`roles`** — admin-managed
```
id    TEXT PK
name  TEXT UNIQUE NOT NULL
```

**`positions`** — admin-managed
```
id    TEXT PK
name  TEXT UNIQUE NOT NULL
```

**`employeeRoles`** (many-to-many)
```
employeeId   TEXT FK → employees.id
roleId       TEXT FK → roles.id
PRIMARY KEY (employeeId, roleId)
```

**`employeePositions`** (many-to-many)
```
employeeId    TEXT FK → employees.id
positionId    TEXT FK → positions.id
PRIMARY KEY (employeeId, positionId)
```

**`accessRequests`** — admin access requests
```
id           TEXT PK
userId       TEXT FK → user.id
status       TEXT (pending|approved|rejected)
createdAt    DATETIME
reviewedAt   DATETIME (nullable)
reviewedBy   TEXT FK → user.id (nullable)
```

### 3.2 Self-referencing hierarchy strategy

Both `employees` and `teams` use an **adjacency list** pattern (a `managerId` / `parentId` self-reference). Queryable recursively with SQLite's CTE support:

```sql
WITH RECURSIVE emp_tree AS (
  SELECT id, firstName, lastName, managerId, 0 AS depth
  FROM employees WHERE managerId IS NULL
  UNION ALL
  SELECT e.id, e.firstName, e.lastName, e.managerId, t.depth + 1
  FROM employees e JOIN emp_tree t ON e.managerId = t.id
)
SELECT * FROM emp_tree;
```

---

## 4. API Routes

All routes live under `app/api/`. Every route (except auth endpoints) is protected by a session check. Admin routes additionally require `isAdmin = true` or owner status.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/employees` | user | List all employees (with roles, positions, teams) |
| POST | `/api/employees` | admin | Create employee |
| GET | `/api/employees/[id]` | user | Get single employee |
| PUT | `/api/employees/[id]` | admin | Update employee |
| DELETE | `/api/employees/[id]` | admin | Delete employee |
| GET | `/api/employees/tree` | user | Return full hierarchy as nested JSON |
| GET | `/api/teams` | user | List all teams |
| POST | `/api/teams` | admin | Create team |
| GET | `/api/teams/[id]` | user | Get single team |
| PUT | `/api/teams/[id]` | admin | Update team |
| DELETE | `/api/teams/[id]` | admin | Delete team |
| GET | `/api/teams/tree` | user | Return full team hierarchy as nested JSON |
| GET | `/api/roles` | user | List all roles |
| POST | `/api/roles` | admin | Create role |
| PUT | `/api/roles/[id]` | admin | Update role |
| DELETE | `/api/roles/[id]` | admin | Delete role (blocked if assigned to employees) |
| GET | `/api/positions` | user | List all positions |
| POST | `/api/positions` | admin | Create position |
| PUT | `/api/positions/[id]` | admin | Update position |
| DELETE | `/api/positions/[id]` | admin | Delete position (blocked if assigned to employees) |
| GET | `/api/admin/access-requests` | admin | List all admin access requests |
| POST | `/api/admin/access-requests` | user | Submit an admin access request |
| PUT | `/api/admin/access-requests/[id]` | admin | Approve or reject an access request |
| PUT | `/api/admin/registrations/[id]` | admin | Approve or reject a pending registration |
| POST | `/api/auth/[...all]` | — | better-auth catch-all handler |

---

## 5. Application Pages & Routes

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx              ← public login / register page
│   └── pending-approval/
│       └── page.tsx              ← shown to users awaiting registration approval
├── (app)/
│   ├── layout.tsx                ← session guard + nav shell
│   ├── page.tsx                  ← main page: dual hierarchy view
│   ├── request-admin/
│   │   └── page.tsx              ← form for approved users to request admin access
│   ├── employees/
│   │   ├── page.tsx              ← employee list + search
│   │   ├── new/page.tsx          ← create employee form
│   │   └── [id]/
│   │       ├── page.tsx          ← employee detail
│   │       └── edit/page.tsx     ← edit employee form
│   ├── teams/
│   │   ├── page.tsx              ← team list
│   │   ├── new/page.tsx          ← create team form
│   │   └── [id]/
│   │       ├── page.tsx          ← team detail + members
│   │       └── edit/page.tsx     ← edit team form
│   └── admin/
│       ├── layout.tsx            ← admin guard (redirects non-admins)
│       ├── page.tsx              ← admin hub with pending-item counters
│       ├── roles/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/edit/page.tsx
│       ├── positions/
│       │   ├── page.tsx
│       │   ├── new/page.tsx
│       │   └── [id]/edit/page.tsx
│       ├── registrations/
│       │   └── page.tsx          ← approve / reject pending sign-ups
│       └── access-requests/
│           └── page.tsx          ← approve / reject admin access requests
```

---

## 6. Key Components

**`HierarchyTree`** — reusable collapsible tree component. Accepts a `TreeNode[]` prop and renders recursive nodes. Each node is expandable/collapsible, shows badges for roles/positions, and links to the detail page.

**`HierarchyPanel`** — wraps `HierarchyTree` with a search/filter bar that filters visible nodes by name.

**`EmployeeForm`** — shared create/edit form. Fields: first name, last name, email, phone, avatar URL, manager (searchable select), team memberships (multi-select), roles (multi-checkbox), positions (multi-checkbox).

**`TeamForm`** — create/edit form for teams. Fields: name, description, parent team (select).

**`BadgeGroup`** — renders a horizontal list of pill badges for roles and positions with consistent colour coding.

**`LookupForm`** — shared create/edit form for roles and positions. Configurable labels and redirect target.

**`DeleteLookupButton`** — confirmation-based delete for roles/positions; shows an error if the item is currently assigned to any employee.

**`AccessRequestActions`** — approve/reject buttons for admin access requests.

**`RegistrationActions`** — approve/reject buttons for pending user registrations.

**`RequestAdminButton`** — allows an approved non-admin user to submit an admin access request.

---

## 7. Authentication

better-auth is configured with the **credentials provider** only. No OAuth in scope.

- Session is stored in the SQLite database (better-auth manages its own tables).
- `proxy.ts` at the root intercepts all `/(app)` routes and validates the session cookie.
- New users register via the login page and are created with `registrationStatus: 'pending'`. They are redirected to `/pending-approval` until an admin approves them.
- Two custom user fields are added via `additionalFields` (both `input: false`, not settable at registration):
  - `isAdmin` — boolean, grants admin privileges
  - `registrationStatus` — `'pending' | 'approved' | 'rejected'`

Session helpers in `lib/session.ts`:

| Helper | Purpose |
|---|---|
| `getSession()` | Returns the current session (cached per-request) |
| `requireAuth()` | Throws/redirects if unauthenticated |
| `requireApproved()` | Throws/redirects if registration is not approved |
| `requireAdmin()` | Throws/redirects if not admin or owner |
| `checkIsAdmin()` | Boolean check from request headers (for API routes) |
| `getIsAdmin()` | Boolean check from session object |

Configuration sketch:
```ts
// lib/auth.ts
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'sqlite', schema: { ... } }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      isAdmin: { type: 'boolean', defaultValue: false, input: false, returned: true },
      registrationStatus: { type: 'string', defaultValue: 'pending', input: false, returned: true },
    },
  },
});
```

---

## 8. Admin System

### Permission levels (highest to lowest)

| Level | Condition |
|---|---|
| Owner | Email matches `OWNER_EMAIL` env var — permanent super-admin, bypasses all checks |
| Admin | `user.isAdmin = true` in the database |
| Approved user | `user.registrationStatus = 'approved'` |
| Pending user | `user.registrationStatus = 'pending'` — can only see `/pending-approval` |

### Registration approval flow

1. User registers on the login page → `registrationStatus = 'pending'`
2. Redirected to `/pending-approval`
3. Admin reviews pending sign-ups at `/admin/registrations`
4. **Approve** → `registrationStatus = 'approved'`; user gains full access on next load
5. **Reject** → `registrationStatus = 'rejected'`; user sees rejection message

### Admin access request flow

1. Approved non-admin user visits `/request-admin` and submits a request
2. Only one pending request allowed per user (409 if a pending request already exists)
3. Admin reviews requests at `/admin/access-requests`
4. **Approve** → `isAdmin = true`, `reviewedBy` and `reviewedAt` recorded
5. **Reject** → request marked rejected; user must sign out and back in after approval to activate new permissions

### Admin panel (`/admin`)

Four subsections, with badge counters for pending items on the hub page:

| Section | Path | Purpose |
|---|---|---|
| Roles | `/admin/roles` | Create, rename, delete roles |
| Positions | `/admin/positions` | Create, rename, delete positions |
| Registrations | `/admin/registrations` | Approve / reject new sign-ups |
| Access Requests | `/admin/access-requests` | Approve / reject admin requests |

---

## 9. Testing

Vitest with a Node.js environment.

```
tests/
├── api/
│   ├── employees.test.ts
│   ├── employees-id.test.ts
│   ├── employees-tree.test.ts
│   ├── teams.test.ts
│   ├── teams-id.test.ts
│   └── teams-tree.test.ts
├── lib/
│   ├── cycles.test.ts
│   ├── formatName.test.ts
│   └── teamColors.test.ts
└── hooks/
    ├── nameFormatContext.test.tsx
    └── useDarkMode.test.ts
```

API tests mock the database via a queue-based `createMockDb()` helper and mock `@/lib/session` to control auth state. Library tests are pure unit tests with no mocks.

Config: `vitest.config.mjs`

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

---

## 10. Main Page — Dual Hierarchy View

The home page (`/`) renders two side-by-side panels:

**Left panel — Team hierarchy**: the full team tree, showing each team's name, member count, and sub-teams. Clicking a team expands it and shows direct members with their positions.

**Right panel — Employee hierarchy**: the reporting-line tree rooted at employees with no manager. Each node shows name, primary role badges, and position badges. Supports expand/collapse per node.

Both trees are rendered client-side after an initial server-side data fetch. A search/filter bar sits above each panel (`HierarchyPanel`) to filter visible nodes by name.

---

## 11. Data Constraints & Business Rules

- An employee's `managerId` must not create a cycle (validated server-side before save).
- A team's `parentId` must not create a cycle (same).
- Deleting an employee who manages others is blocked until their reports are reassigned.
- Deleting a team that has sub-teams is blocked until sub-teams are reassigned or deleted.
- An employee can belong to multiple teams, hold multiple roles, and hold multiple positions simultaneously.
- Roles and positions are managed by admins via `/admin/roles` and `/admin/positions`. Deletion is blocked if the item is currently assigned to any employee.

---

## 12. Project Structure

```
domain-manager/
├── app/
│   ├── (auth)/login/
│   ├── (auth)/pending-approval/
│   ├── (app)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── request-admin/
│   │   ├── employees/
│   │   ├── teams/
│   │   └── admin/
│   └── api/
│       ├── employees/
│       ├── teams/
│       ├── roles/
│       ├── positions/
│       ├── admin/
│       │   ├── access-requests/
│       │   └── registrations/
│       └── auth/[...all]/
├── components/
│   ├── HierarchyTree.tsx
│   ├── HierarchyPanel.tsx
│   ├── EmployeeForm.tsx
│   ├── TeamForm.tsx
│   ├── BadgeGroup.tsx
│   └── admin/
│       ├── LookupForm.tsx
│       ├── DeleteLookupButton.tsx
│       ├── AccessRequestActions.tsx
│       └── RegistrationActions.tsx
├── lib/
│   ├── auth.ts
│   ├── auth-client.ts
│   ├── db.ts              ← Drizzle client singleton
│   ├── session.ts         ← session helpers + admin checks
│   ├── cycles.ts          ← cycle detection for manager/parent chains
│   ├── formatName.ts
│   └── nameFormatContext.tsx
├── drizzle/
│   ├── schema.ts          ← all table definitions
│   └── migrations/
├── tests/
│   ├── api/
│   ├── lib/
│   └── hooks/
├── proxy.ts               ← request intercept (replaces middleware.ts)
├── vitest.config.mjs
└── drizzle.config.ts
```

---

## 13. Development & Deployment

```bash
# Install
npm install

# DB migrations
npx drizzle-kit generate
npx drizzle-kit migrate

# Dev
npm run dev

# Build
npm run build && npm run start

# Tests
npm run test
```

Environment variables needed:
```
BETTER_AUTH_SECRET=<random 32+ char string>
BETTER_AUTH_URL=http://localhost:3000
DATABASE_URL=./domain.db
OWNER_EMAIL=<email that gets permanent owner/admin status>
```

The app can be deployed to any Node.js host (Railway, Render, a VPS). SQLite is file-based, so ensure the database file path is on a persistent volume in production.
