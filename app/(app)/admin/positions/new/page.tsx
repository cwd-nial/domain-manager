import Link from 'next/link';

import { LookupForm } from '@/components/admin/LookupForm';

export default function NewPositionPage() {
    return (
        <div className="max-w-xl">
            <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">New Position</h1>
            <LookupForm apiUrl="/api/positions" method="POST" redirectTo="/admin/positions" label="Position name" />
            <div className="mt-6">
                <Link href="/admin/positions" className="secondary-text hover:underline">
                    ← Back to Positions
                </Link>
            </div>
        </div>
    );
}
