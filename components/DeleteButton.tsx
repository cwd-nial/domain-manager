'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type DeleteButtonProps = {
    url: string;
    redirectTo: string;
    label?: string;
};

export function DeleteButton({ url, redirectTo, label = 'Delete' }: DeleteButtonProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleDelete() {
        if (!confirm('Are you sure? This cannot be undone.')) return;
        setLoading(true);
        setError('');
        const res = await fetch(url, { method: 'DELETE' });
        if (res.ok) {
            router.push(redirectTo);
        } else {
            const data = await res.json();
            setError(data.error ?? 'Delete failed');
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col items-start gap-1">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
                onClick={handleDelete}
                disabled={loading}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
                {loading ? 'Deleting…' : label}
            </button>
        </div>
    );
}
