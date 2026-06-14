'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';

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
            <Button variant="danger" onClick={handleDelete} disabled={loading}>
                {loading ? 'Deleting…' : label}
            </Button>
        </div>
    );
}
