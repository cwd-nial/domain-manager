import Link from 'next/link';

import { buttonCls } from '@/components/ui/Button';
import { DeleteLookupButton } from '@/components/admin/DeleteLookupButton';
import { roles } from '@/drizzle/schema';
import { db } from '@/lib/db';

export default async function AdminRolesPage() {
    const all = await db.select().from(roles).orderBy(roles.name);

    return (
        <div className="max-w-xl">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Roles</h1>
                <Link href="/admin/roles/new" className={buttonCls('primary', 'sm')}>
                    + New Role
                </Link>
            </div>

            {all.length === 0 ? (
                <p className="secondary-text">No roles yet.</p>
            ) : (
                <ul className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
                    {all.map((role) => (
                        <li
                            key={role.id}
                            className="flex items-center justify-between bg-white px-4 py-3 dark:bg-gray-900"
                        >
                            <span className="text-sm text-gray-900 dark:text-gray-100">{role.name}</span>
                            <div className="flex items-center gap-4">
                                <Link href={`/admin/roles/${role.id}/edit`} className="link-primary text-sm">
                                    Edit
                                </Link>
                                <DeleteLookupButton apiUrl={`/api/roles/${role.id}`} label={role.name} />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            <div className="mt-4">
                <Link href="/admin" className="secondary-text hover:underline">
                    ← Back to Admin
                </Link>
            </div>
        </div>
    );
}
