import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { user } from '@/drizzle/schema';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function requireAuth() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) redirect('/login');
    return session;
}

export async function getSession() {
    return auth.api.getSession({ headers: await headers() });
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
