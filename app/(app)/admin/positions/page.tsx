import Link from 'next/link';

import { DeleteLookupButton } from '@/components/admin/DeleteLookupButton';
import { positions } from '@/drizzle/schema';
import { db } from '@/lib/db';

export default async function AdminPositionsPage() {
    const all = await db.select().from(positions).orderBy(positions.name);

    return (
        <div className="max-w-xl">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Positions</h1>
                <Link
                    href="/admin/positions/new"
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 dark:bg-teal-600 dark:hover:bg-teal-700"
                >
                    + New Position
                </Link>
            </div>

            {all.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No positions yet.</p>
            ) : (
                <ul className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
                    {all.map((pos) => (
                        <li
                            key={pos.id}
                            className="flex items-center justify-between bg-white px-4 py-3 dark:bg-gray-900"
                        >
                            <span className="text-sm text-gray-900 dark:text-gray-100">{pos.name}</span>
                            <div className="flex items-center gap-4">
                                <Link
                                    href={`/admin/positions/${pos.id}/edit`}
                                    className="text-sm text-blue-600 hover:underline dark:text-teal-400"
                                >
                                    Edit
                                </Link>
                                <DeleteLookupButton apiUrl={`/api/positions/${pos.id}`} label={pos.name} />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            <div className="mt-4">
                <Link href="/admin" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
                    ← Back to Admin
                </Link>
            </div>
        </div>
    );
}
