import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "@/drizzle/schema";

const client = createClient({
    url: `file:${process.env.DATABASE_URL ?? "./domain.db"}`,
});

await client.execute({ sql: "PRAGMA journal_mode = WAL", args: [] });
await client.execute({ sql: "PRAGMA foreign_keys = ON", args: [] });

// Create all tables on first run
await client.batch([
    // ── better-auth tables ────────────────────────────────────────────────────
    {
        sql: `CREATE TABLE IF NOT EXISTS user (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      email_verified INTEGER NOT NULL DEFAULT 0,
      image TEXT,
      created_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
      updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer))
    )`,
        args: [],
    },
    {
        sql: `CREATE TABLE IF NOT EXISTS session (
      id TEXT PRIMARY KEY,
      expires_at INTEGER NOT NULL,
      token TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
      updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
      ip_address TEXT,
      user_agent TEXT,
      user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
    )`,
        args: [],
    },
    {
        sql: `CREATE TABLE IF NOT EXISTS account (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      provider_id TEXT NOT NULL,
      user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
      access_token TEXT,
      refresh_token TEXT,
      id_token TEXT,
      access_token_expires_at INTEGER,
      refresh_token_expires_at INTEGER,
      scope TEXT,
      password TEXT,
      created_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
      updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer))
    )`,
        args: [],
    },
    {
        sql: `CREATE TABLE IF NOT EXISTS verification (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL,
      value TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
      updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer))
    )`,
        args: [],
    },
    // ── App tables ─────────────────────────────────────────────────────────────
    {
        sql: `CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL DEFAULT '',
      last_name TEXT NOT NULL DEFAULT '',
      email TEXT UNIQUE,
      phone TEXT,
      avatar_url TEXT,
      manager_id TEXT REFERENCES employees(id),
      created_at INTEGER,
      updated_at INTEGER
    )`,
        args: [],
    },
    {
        sql: `CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      parent_id TEXT REFERENCES teams(id),
      created_at INTEGER,
      updated_at INTEGER
    )`,
        args: [],
    },
    {
        sql: `CREATE TABLE IF NOT EXISTS employee_teams (
      employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
      PRIMARY KEY (employee_id, team_id)
    )`,
        args: [],
    },
    {
        sql: `CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    )`,
        args: [],
    },
    {
        sql: `CREATE TABLE IF NOT EXISTS positions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    )`,
        args: [],
    },
    {
        sql: `CREATE TABLE IF NOT EXISTS employee_roles (
      employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      role_id TEXT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      PRIMARY KEY (employee_id, role_id)
    )`,
        args: [],
    },
    {
        sql: `CREATE TABLE IF NOT EXISTS employee_positions (
      employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      position_id TEXT NOT NULL REFERENCES positions(id) ON DELETE CASCADE,
      PRIMARY KEY (employee_id, position_id)
    )`,
        args: [],
    },
]);

// ── Seed static lookup tables ─────────────────────────────────────────────────

const ROLES = [
    { id: "role_frontend_dev", name: "Frontend developer" },
    { id: "role_backend_dev", name: "Backend developer" },
    { id: "role_fullstack_dev", name: "Fullstack developer" },
    { id: "role_dev_ops", name: "DevOps" },
    { id: "role_qa_engineer", name: "QA engineer" },
    { id: "role_product_owner", name: "Product Owner" },
    { id: "role_ux_designer", name: "UX designer" },
] as const;

const POSITIONS = [
    { id: "pos_domain_lead", name: "Domain Lead" },
    { id: "pos_solution_architect", name: "Solution Architect" },
    { id: "pos_team_lead", name: "Team Lead" },
    { id: "pos_engineering_lead", name: "Engineering Lead" },
    { id: "pos_developer", name: "Developer" },
    { id: "pos_po", name: "PO" },
    { id: "pos_qa", name: "QA" },
    { id: "pos_ux", name: "UX" },
] as const;

const rolesCount = await client.execute({
    sql: "SELECT COUNT(*) as count FROM roles",
    args: [],
});
if ((rolesCount.rows[0] as unknown as { count: number }).count === 0) {
    await client.batch(
        ROLES.map(({ id, name }) => ({
            sql: "INSERT OR IGNORE INTO roles (id, name) VALUES (?, ?)",
            args: [id, name],
        })),
    );
}

const positionsCount = await client.execute({
    sql: "SELECT COUNT(*) as count FROM positions",
    args: [],
});
if ((positionsCount.rows[0] as unknown as { count: number }).count === 0) {
    await client.batch(
        POSITIONS.map(({ id, name }) => ({
            sql: "INSERT OR IGNORE INTO positions (id, name) VALUES (?, ?)",
            args: [id, name],
        })),
    );
}

// ── Migrate employees: split name → first_name/last_name, then drop name ──────
const empCols = await client.execute({
    sql: "PRAGMA table_info(employees)",
    args: [],
});
const empColNames = new Set(empCols.rows.map((r) => String(r[1])));

// Step 1: add first_name/last_name if missing (old DBs without the columns)
if (!empColNames.has("first_name")) {
    await client.batch([
        {
            sql: "ALTER TABLE employees ADD COLUMN first_name TEXT NOT NULL DEFAULT ''",
            args: [],
        },
        {
            sql: "ALTER TABLE employees ADD COLUMN last_name TEXT NOT NULL DEFAULT ''",
            args: [],
        },
    ]);
    await client.execute({
        sql: `UPDATE employees SET
      first_name = CASE WHEN instr(name, ' ') > 0
        THEN substr(name, 1, instr(name, ' ') - 1)
        ELSE name END,
      last_name = CASE WHEN instr(name, ' ') > 0
        THEN substr(name, instr(name, ' ') + 1)
        ELSE '' END`,
        args: [],
    });
}

// Step 2: drop the name column by recreating the table without it
if (empColNames.has("name")) {
    await client.execute({ sql: "PRAGMA foreign_keys = OFF", args: [] });
    await client.execute({ sql: "DROP TABLE IF EXISTS employees_new", args: [] });
    await client.execute({
        sql: `CREATE TABLE employees_new (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL DEFAULT '',
      last_name TEXT NOT NULL DEFAULT '',
      email TEXT UNIQUE,
      phone TEXT,
      avatar_url TEXT,
      manager_id TEXT REFERENCES employees(id),
      created_at INTEGER,
      updated_at INTEGER
    )`,
        args: [],
    });
    await client.execute({
        sql: `INSERT INTO employees_new
      (id, first_name, last_name, email, phone, avatar_url, manager_id, created_at, updated_at)
      SELECT id, first_name, last_name, email, phone, avatar_url, manager_id, created_at, updated_at
      FROM employees`,
        args: [],
    });
    await client.execute({ sql: "DROP TABLE employees", args: [] });
    await client.execute({
        sql: "ALTER TABLE employees_new RENAME TO employees",
        args: [],
    });
    await client.execute({ sql: "PRAGMA foreign_keys = ON", args: [] });
}

export const db = drizzle(client, { schema });
