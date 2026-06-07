import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { user } from '@/drizzle/schema';
import { db } from '@/lib/db';
import { checkIsAdmin } from '@/lib/session';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!(await checkIsAdmin(request.headers))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const { action } = (await request.json()) as { action: 'approve' | 'reject' };

    if (action !== 'approve' && action !== 'reject')
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    const [target] = await db.select({ registrationStatus: user.registrationStatus }).from(user).where(eq(user.id, id));
    if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (target.registrationStatus !== 'pending')
        return NextResponse.json({ error: 'Registration already processed' }, { status: 409 });

    await db
        .update(user)
        .set({ registrationStatus: action === 'approve' ? 'approved' : 'rejected' })
        .where(eq(user.id, id));

    return NextResponse.json({ success: true });
}
