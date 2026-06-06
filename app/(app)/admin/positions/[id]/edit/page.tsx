import { eq } from 'drizzle-orm';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { LookupForm } from '@/components/admin/LookupForm';
import { positions } from '@/drizzle/schema';
import { db } from '@/lib/db';

export default async function EditPositionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const [pos] = await db.select().from(positions).where(eq(positions.id, id));
    if (!pos) notFound();

    return (
        <div className="max-w-xl">
            <h1 className="mb-6 text-2xl font-semibold text-gray-900 dark:text-gray-100">Edit Position</h1>
            <LookupForm
                defaultName={pos.name}
                apiUrl={`/api/positions/${id}`}
                method="PUT"
                redirectTo="/admin/positions"
                label="Position name"
            />
            <div className="mt-6">
                <Link href="/admin/positions" className="text-sm text-gray-500 hover:underline dark:text-gray-400">
                    ← Back to Positions
                </Link>
            </div>
        </div>
    );
}
