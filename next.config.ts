import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // kysely doesn't export DEFAULT_MIGRATION_LOCK_TABLE from its public index;
    // @better-auth/kysely-adapter's D1 dialect imports it, but only via a dynamic
    // import that's never triggered. Marking kysely external skips Turbopack's
    // strict named-export check at build time without affecting runtime.
    serverExternalPackages: ['kysely'],
};

export default nextConfig;
