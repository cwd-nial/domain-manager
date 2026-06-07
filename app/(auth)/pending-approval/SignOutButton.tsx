'use client';

import { useRouter } from 'next/navigation';

import { authClient } from '@/lib/auth-client';

export function SignOutButton() {
    const router = useRouter();

    async function signOut() {
        await authClient.signOut();
        router.push('/login');
    }

    return (
        <button
            onClick={signOut}
            className="text-sm text-gray-500 hover:underline dark:text-gray-400"
        >
            Sign out
        </button>
    );
}
