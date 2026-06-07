import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import { user } from '@/drizzle/schema';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// Deduplicated per-request — all auth helpers share one session lookup per render.
export const getSession = cache(async () =>
    auth.api.getSession({ headers: await headers() })
);

export async function requireAuth() {
    const session = await getSession();
    if (!session) redirect('/login');
    return session;
}

function isOwner(email: string) {
    return !!process.env.OWNER_EMAIL && email === process.env.OWNER_EMAIL;
}

export async function getIsAdmin(): Promise<boolean> {
    const session = await getSession();
    if (!session) return false;
    if (isOwner(session.user.email)) return true;
    return !!(session.user as any).isAdmin;
}

export async function requireAdmin() {
    const session = await requireAuth();
    if (isOwner(session.user.email)) return session;
    if (!(session.user as any).isAdmin) redirect('/');
    return session;
}

export async function requireApproved() {
    const session = await requireAuth();
    if (isOwner(session.user.email)) return session;
    const [row] = await db
        .select({ registrationStatus: user.registrationStatus })
        .from(user)
        .where(eq(user.id, session.user.id));
    if (row?.registrationStatus === 'approved') return session;
    redirect('/pending-approval');
}

export async function checkIsAdmin(requestHeaders: Headers): Promise<boolean> {
    const session = await auth.api.getSession({ headers: requestHeaders });
    if (!session) return false;
    if (isOwner(session.user.email)) return true;
    return !!(session.user as any).isAdmin;
}
