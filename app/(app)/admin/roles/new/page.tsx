import Link from 'next/link';

import { LookupForm } from '@/components/admin/LookupForm';

export default function NewRolePage() {
    return (
        <div className="max-w-xl">
            <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">New Role</h1>
            <LookupForm apiUrl="/api/roles" method="POST" redirectTo="/admin/roles" label="Role name" />
            <div className="mt-6">
                <Link href="/admin/roles" className="secondary-text hover:underline">
                    ← Back to Roles
                </Link>
            </div>
        </div>
    );
}
