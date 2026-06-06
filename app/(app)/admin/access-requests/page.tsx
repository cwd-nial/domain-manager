import Link from "next/link";
import { eq } from "drizzle-orm";

import { AccessRequestActions } from "@/components/admin/AccessRequestActions";
import { accessRequests, user } from "@/drizzle/schema";
import { db } from "@/lib/db";

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

    const pending = rows.filter((r) => r.status === "pending");
    const reviewed = rows.filter((r) => r.status !== "pending");

    function formatDate(d: Date | null) {
        if (!d) return "—";
        return new Date(d).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    }

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Access Requests
            </h1>

            <section className="mb-8">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                    Pending ({pending.length})
                </h2>
                {pending.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No pending requests.</p>
                ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        {pending.map((req) => (
                            <li
                                key={req.id}
                                className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900"
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
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">
                        Reviewed
                    </h2>
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        {reviewed.map((req) => (
                            <li
                                key={req.id}
                                className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900"
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
                                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                        req.status === "approved"
                                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                            : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
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
                <Link href="/admin" className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
                    ← Back to Admin
                </Link>
            </div>
        </div>
    );
}
