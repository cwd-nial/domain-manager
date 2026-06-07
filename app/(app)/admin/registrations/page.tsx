import { asc, ne } from 'drizzle-orm';
import Link from 'next/link';

import { RegistrationActions } from '@/components/admin/RegistrationActions';
import { user } from '@/drizzle/schema';
import { db } from '@/lib/db';

export default async function RegistrationsPage() {
    const rows = await db
        .select({
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            registrationStatus: user.registrationStatus,
        })
        .from(user)
        .where(ne(user.registrationStatus, 'approved'))
        .orderBy(asc(user.createdAt));

    const pending = rows.filter((r) => r.registrationStatus === 'pending');
    const rejected = rows.filter((r) => r.registrationStatus === 'rejected');

    function formatDate(d: Date | null) {
        if (!d) return '—';
        return new Date(d).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }

    return (
        <div className="max-w-2xl">
            <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">Registrations</h1>

            <section className="mb-8">
                <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                    Pending ({pending.length})
                </h2>
                {pending.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No pending registrations.</p>
                ) : (
                    <ul className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
                        {pending.map((u) => (
                            <li
                                key={u.id}
                                className="flex items-center justify-between bg-white px-4 py-3 dark:bg-gray-900"
                            >
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{u.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {u.email} &middot; {formatDate(u.createdAt)}
                                    </p>
                                </div>
                                <RegistrationActions userId={u.id} />
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {rejected.length > 0 && (
                <section>
                    <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                        Rejected
                    </h2>
                    <ul className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
                        {rejected.map((u) => (
                            <li
                                key={u.id}
                                className="flex items-center justify-between bg-white px-4 py-3 dark:bg-gray-900"
                            >
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{u.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {u.email} &middot; {formatDate(u.createdAt)}
                                    </p>
                                </div>
                                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                    rejected
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <div className="mt-6">
                <Link href="/admin" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
                    ← Back to Admin
                </Link>
            </div>
        </div>
    );
}
