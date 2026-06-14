'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';

export function RequestAdminButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleRequest() {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/admin/access-requests', { method: 'POST' });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setError(data.error ?? 'Something went wrong');
                return;
            }
            router.refresh();
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            {error && <p className="mb-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
            <Button onClick={handleRequest} disabled={loading}>
                {loading ? 'Submitting…' : 'Request Admin Access'}
            </Button>
        </div>
    );
}
