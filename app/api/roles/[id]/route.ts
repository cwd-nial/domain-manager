import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { employeeRoles, roles } from '@/drizzle/schema';
import { db } from '@/lib/db';
import { checkIsAdmin } from '@/lib/session';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!(await checkIsAdmin(request.headers))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const { name } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    await db.update(roles).set({ name: name.trim() }).where(eq(roles.id, id));
    return NextResponse.json({ id });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!(await checkIsAdmin(request.headers))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;

    const refs = await db.select().from(employeeRoles).where(eq(employeeRoles.roleId, id));
    if (refs.length > 0)
        return NextResponse.json({ error: 'Role is assigned to employees and cannot be deleted' }, { status: 409 });

    await db.delete(roles).where(eq(roles.id, id));
    return new NextResponse(null, { status: 204 });
}
