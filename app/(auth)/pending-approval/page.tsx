import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { user } from '@/drizzle/schema';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

import { SignOutButton } from './SignOutButton';

export default async function PendingApprovalPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const [row] = await db
        .select({ registrationStatus: user.registrationStatus })
        .from(user)
        .where(eq(user.id, session.user.id));

    if (row?.registrationStatus === 'approved') redirect('/');

    const isRejected = row?.registrationStatus === 'rejected';

    return (
        <main className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-sm rounded-xl border border-gray-200 p-8 shadow-sm dark:border-gray-700">
                <h1 className="mb-3 text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {isRejected ? 'Registration not approved' : 'Awaiting approval'}
                </h1>
                <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                    {isRejected
                        ? 'Your registration request was not approved. Contact an administrator if you believe this is an error.'
                        : 'Your account is pending approval. You will be able to access the app once an administrator reviews your registration.'}
                </p>
                <SignOutButton />
            </div>
        </main>
    );
}
