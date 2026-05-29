import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/drizzle/schema";

const client = createClient({
  url: `file:${process.env.DATABASE_URL ?? "./domain.db"}`,
});

await client.execute({ sql: "PRAGMA journal_mode = WAL", args: [] });

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
      name TEXT NOT NULL,
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

export const db = drizzle(client, { schema });
