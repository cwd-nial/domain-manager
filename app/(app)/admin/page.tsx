import { eq } from 'drizzle-orm';
import Link from 'next/link';

import { accessRequests, user } from '@/drizzle/schema';
import { db } from '@/lib/db';

export default async function AdminPage() {
    const [pending, pendingRegs] = await Promise.all([
        db.select({ id: accessRequests.id }).from(accessRequests).where(eq(accessRequests.status, 'pending')),
        db.select({ id: user.id }).from(user).where(eq(user.registrationStatus, 'pending')),
    ]);

    const pendingCount = pending.length;
    const pendingRegsCount = pendingRegs.length;

    const sections = [
        { href: '/admin/roles', label: 'Roles', description: 'Create, edit and delete employee roles' },
        {
            href: '/admin/positions',
            label: 'Positions',
            description: 'Create, edit and delete employee positions',
        },
        {
            href: '/admin/registrations',
            label: 'Registrations',
            description: 'Approve or reject new user registrations',
            badge: pendingRegsCount > 0 ? pendingRegsCount : null,
        },
        {
            href: '/admin/access-requests',
            label: 'Access Requests',
            description: 'Review and approve requests for admin access',
            badge: pendingCount > 0 ? pendingCount : null,
        },
    ];

    return (
        <div className="max-w-2xl">
            <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">Admin</h1>
            <div className="flex flex-col gap-3">
                {sections.map(({ href, label, description, badge }) => (
                    <Link
                        key={href}
                        href={href}
                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-blue-400 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-teal-500"
                    >
                        <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
                            <p className="secondary-text">{description}</p>
                        </div>
                        {badge != null && (
                            <span className="ml-3 inline-flex items-center justify-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900 dark:text-red-300">
                                {badge}
                            </span>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}
