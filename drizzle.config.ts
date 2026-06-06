import { defineConfig } from 'drizzle-kit';

const raw = process.env.DATABASE_URL ?? './domain.db';
const isTurso = raw.startsWith('libsql://') || raw.startsWith('https://');

export default defineConfig({
    schema: './drizzle/schema.ts',
    out: './drizzle/migrations',
    dialect: 'turso',
    dbCredentials: {
        url: isTurso ? raw : `file:${raw}`,
        ...(isTurso && { authToken: process.env.DATABASE_AUTH_TOKEN }),
    },
});
