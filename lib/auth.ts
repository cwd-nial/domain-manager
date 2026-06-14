import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';

import * as schema from '@/drizzle/schema';
import { db } from '@/lib/db';

const extra = process.env.BETTER_AUTH_TRUSTED_ORIGINS
    ? process.env.BETTER_AUTH_TRUSTED_ORIGINS.split(',').map((s) => s.trim())
    : [];

export const auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: extra,
    database: drizzleAdapter(db, {
        provider: 'sqlite',
        schema: {
            user: schema.user,
            session: schema.session,
            account: schema.account,
            verification: schema.verification,
        },
    }),
    emailAndPassword: { enabled: true },
    user: {
        additionalFields: {
            isAdmin: {
                type: 'boolean',
                required: false,
                defaultValue: false,
                input: false,
                returned: true,
            },
            registrationStatus: {
                type: 'string',
                required: false,
                defaultValue: 'pending',
                input: false,
                returned: true,
            },
        },
    },
});
