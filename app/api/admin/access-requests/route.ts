import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { accessRequests, user } from '@/drizzle/schema';
import { db } from '@/lib/db';
import { checkIsAdmin, getSession } from '@/lib/session';

export async function GET(request: Request) {
    if (!(await checkIsAdmin(request.headers))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const rows = await db
        .select({
            id: accessRequests.id,
            status: accessRequests.status,
            createdAt: accessRequests.createdAt,
            reviewedAt: accessRequests.reviewedAt,
            userId: accessRequests.userId,
            userName: user.name,
            userEmail: user.email,
            reviewedBy: accessRequests.reviewedBy,
        })
        .from(accessRequests)
        .innerJoin(user, eq(accessRequests.userId, user.id))
        .orderBy(accessRequests.createdAt);

    return NextResponse.json(rows);
}

export async function POST(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const existing = await db.select().from(accessRequests).where(eq(accessRequests.userId, session.user.id));

    const hasPending = existing.some((r) => r.status === 'pending');
    if (hasPending) return NextResponse.json({ error: 'Request already pending' }, { status: 409 });

    const id = crypto.randomUUID();
    await db.insert(accessRequests).values({ id, userId: session.user.id });
    return NextResponse.json({ id }, { status: 201 });
}
