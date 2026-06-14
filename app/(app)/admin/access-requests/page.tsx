import { eq } from 'drizzle-orm';
import Link from 'next/link';

import { AccessRequestActions } from '@/components/admin/AccessRequestActions';
import { accessRequests, user } from '@/drizzle/schema';
import { db } from '@/lib/db';

export default async function AccessRequestsPage() {
    const rows = await db
        .select({
            id: accessRequests.id,
            status: accessRequests.status,
            createdAt: accessRequests.createdAt,
            reviewedAt: accessRequests.reviewedAt,
            userName: user.name,
            userEmail: user.email,
        })
        .from(accessRequests)
        .innerJoin(user, eq(accessRequests.userId, user.id))
        .orderBy(accessRequests.createdAt);

    const pending = rows.filter((r) => r.status === 'pending');
    const reviewed = rows.filter((r) => r.status !== 'pending');

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
            <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">Access Requests</h1>

            <section className="mb-8">
                <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                    Pending ({pending.length})
                </h2>
                {pending.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No pending requests.</p>
                ) : (
                    <ul className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
                        {pending.map((req) => (
                            <li
                                key={req.id}
                                className="flex items-center justify-between bg-white px-4 py-3 dark:bg-gray-900"
                            >
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {req.userName}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {req.userEmail} &middot; {formatDate(req.createdAt)}
                                    </p>
                                </div>
                                <AccessRequestActions requestId={req.id} />
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {reviewed.length > 0 && (
                <section>
                    <h2 className="mb-3 text-sm font-semibold tracking-wide text-gray-500 uppercase dark:text-gray-400">
                        Reviewed
                    </h2>
                    <ul className="divide-y divide-gray-200 overflow-hidden rounded-lg border border-gray-200 dark:divide-gray-700 dark:border-gray-700">
                        {reviewed.map((req) => (
                            <li
                                key={req.id}
                                className="flex items-center justify-between bg-white px-4 py-3 dark:bg-gray-900"
                            >
                                <div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {req.userName}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {req.userEmail} &middot; {formatDate(req.createdAt)}
                                    </p>
                                </div>
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                        req.status === 'approved'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                    }`}
                                >
                                    {req.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <div className="mt-6">
                <Link href="/admin" className="secondary-text hover:underline">
                    ← Back to Admin
                </Link>
            </div>
        </div>
    );
}
