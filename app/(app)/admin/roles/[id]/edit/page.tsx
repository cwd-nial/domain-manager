import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { LookupForm } from '@/components/admin/LookupForm';
import { roles } from '@/drizzle/schema';
import { db } from '@/lib/db';

export default async function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    if (!role) notFound();

    return (
        <div className="max-w-xl">
            <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">Edit Role</h1>
            <LookupForm
                defaultName={role.name}
                apiUrl={`/api/roles/${id}`}
                method="PUT"
                redirectTo="/admin/roles"
                label="Role name"
            />
            <div className="mt-6">
                <Link href="/admin/roles" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
                    ← Back to Roles
                </Link>
            </div>
        </div>
    );
}
